// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../../interfaces/IConnector.sol";
import "../../interfaces/IStrategy.sol";
import "../../interfaces/IEngine.sol";
import "../../interfaces/IOracle.sol";
import "../constant.sol";

interface CErc20Interface {

     /*** User Interface ***/
    function mint(uint256 mintAmount) external returns (uint256);
    function redeem(uint256 redeemTokens) external returns (uint256);
    function redeemUnderlying(uint256 redeemAmount) external returns (uint256);
    function borrow(uint256 borrowAmount) external returns (uint256);
    function repayBorrow(uint256 repayAmount) external returns (uint256);
    function repayBorrowBehalf(address borrower, uint256 repayAmount) external returns (uint256);
    function exchangeRateCurrent() external returns (uint256);

}

interface ComptrollerInterface {

    /*** Assets You Are In ***/
    function enterMarkets(address[] calldata mTokens) external returns (uint256[] memory);
    function exitMarket(address mToken) external returns (uint256);
}

contract KineticConnector is IConnector, Constants {
     /// @notice Name of the connector
    bytes32 public immutable connectorName;

    /// @notice Type of the connector
    ConnectorType public immutable connectorType;

    /* ========== STATE VARIABLES ========== */

    /// @notice Oracle contract fetches the price of different tokens
    IFluidStrategy public immutable strategyModule;

    /// @notice Engine contract
    IEngine public immutable engine;

    /// @notice Oracle contract fetches the price of different tokens
    IOracle public immutable oracle;

    /* ========== ERRORS ========== */

    /// @notice Thrown when execution fails with a specific reason
    error ExecutionFailed(string reason);

    /// @notice Thrown when an invalid action type is provided
    error InvalidAction();

    /// @notice Initializes the KineticConnector
    /// @param name Name of the Connector
    /// @param _connectorType Type of connector
    constructor(string memory name, ConnectorType _connectorType, address _strategy, address _engine, address _oracle)
    {
        connectorName = keccak256(bytes(name));
        connectorType = _connectorType;
        strategyModule = IFluidStrategy(_strategy);
        engine = IEngine(_engine);
        oracle = IOracle(_oracle);
    }

    /**
     * @notice Gets the name of the connector
     * @return bytes32 The name of the connector
     */
    function getConnectorName() external view override returns (bytes32) {
        return connectorName;
    }

    /**
     * @notice gets the type of the connector
     * @return ConnectorType The type of connector
     */
    function getConnectorType() external view override returns (ConnectorType) {
        return connectorType;
    }


    modifier onlyEngine() {
        require(msg.sender == address(engine), "caller is not the execution engine");
        _;
    }

    // TODO: only the execution engine should be able to call this execute method
    // TODO: add methods for fee withdrawal and unstaking
    /// @notice Executes an action
    function execute(
        ActionType actionType,
        address[] memory assetsIn,
        address assetOut,
        uint256 stepIndex,
        uint256 amountRatio,
        bytes32 strategyId,
        address userAddress,
        bytes calldata
    )
        external
        payable
        override
        onlyEngine
        returns (address, address[] memory, uint256[] memory, address, uint256, address[] memory, uint256[] memory)
    {
        if (actionType == IConnector.ActionType.SUPPLY) {
            return _mintToken(assetsIn[0], assetOut, strategyId, userAddress, amountRatio);
        } else if (actionType == IConnector.ActionType.BORROW) {
            return _borrowToken(assetsIn, assetOut, amountRatio, strategyId, userAddress, stepIndex);
        } else if (actionType == IConnector.ActionType.REPAY) {
            return _repayBorrowToken(assetsIn, assetOut, strategyId, userAddress, stepIndex);
        } else if (actionType == IConnector.ActionType.WITHDRAW) {
            return _withdrawToken(assetsIn, assetOut, strategyId, userAddress, stepIndex);
        }
        revert InvalidAction();
    }

    /// @notice Initially updates the user token balance
    function initialTokenBalanceUpdate(bytes32 strategyId, address userAddress, address token, uint256 amount)
        external
        onlyEngine
    {
        strategyModule.updateUserTokenBalance(strategyId, userAddress, token, amount, 0);
    }

    /// @notice Withdraw user asset
    function withdrawAsset(bytes32 _strategyId, address _user, address _token) external onlyEngine returns (bool) {
        uint256 tokenBalance = strategyModule.getUserTokenBalance(_strategyId, _user, _token);

        require(strategyModule.transferToken(_token, tokenBalance), "Not enough tokens for withdrawal");
        return ERC20(_token).transfer(_user, tokenBalance);
    }

    function _mintToken(address assetIn, address assetOut, bytes32 strategyId, address userAddress, uint256 amountRatio)
        internal
        returns (address, address[] memory, uint256[] memory, address, uint256, address[] memory, uint256[] memory)
    {
        uint256 assetInBalance = strategyModule.getUserTokenBalance(strategyId, userAddress, assetIn);
        require(assetInBalance > 0, "Not enough balance");
        uint256 amountToDeposit = (assetInBalance * amountRatio) / 10_000;

        // transfer token from Strategy Module
        require(strategyModule.transferToken(assetIn, amountToDeposit), "Not enough token");

        // update user token balance
        strategyModule.updateUserTokenBalance(strategyId, userAddress, assetIn, amountToDeposit, 1);

        uint256 shareAmountBefore = ERC20(assetOut).balanceOf(address(this));

        // approve and supply asset
        ERC20(assetIn).approve(assetOut, amountToDeposit);
        // 0=success
        require(CErc20Interface(assetOut).mint(amountToDeposit) == 0, "mint failed");

        uint256 shareAmount = ERC20(assetOut).balanceOf(address(this)) - shareAmountBefore;

        uint256[] memory assetsInAmount = new uint256[](1);
        assetsInAmount[0] = assetInBalance;

        address[] memory underlyingTokens = new address[](1);
        underlyingTokens[0] = assetIn;

        uint256[] memory underlyingAmounts = new uint256[](1);
        underlyingAmounts[0] = amountToDeposit;

        // update user token balance
        strategyModule.updateUserTokenBalance(strategyId, userAddress, assetOut, shareAmount, 0);

        return
            (COMPTROLLER, underlyingTokens, assetsInAmount, assetOut, shareAmount, underlyingTokens, underlyingAmounts);
    }

    function _borrowToken(
        address[] memory assetsIn,
        address assetOut,
        uint256 amountRatio,
        bytes32 strategyId,
        address userAddress,
        uint256 stepIndex
    )
        internal
        returns (address, address[] memory, uint256[] memory, address, uint256, address[] memory, uint256[] memory)
    {
        // expects 3 assetsIn: e.g [token(cbBtc), collateralToken(mw_cbBtc), borrowMwContract(mw_usdc)]
        uint256 assetIn1Balance = strategyModule.getUserTokenBalance(strategyId, userAddress, assetsIn[1]);
        uint256 assetIn0Balance = (assetIn1Balance * CErc20Interface(assetsIn[1]).exchangeRateCurrent()) / 1e18;

        require(assetIn1Balance > 0, "Not enough balance");

        // to borrow, first enter market by calling enterMarkets in comptroller
        address[] memory mTokens = new address[](1);
        mTokens[0] = assetsIn[1];
        ComptrollerInterface(COMPTROLLER).enterMarkets(mTokens);

        // calculate ammount to borrow
        uint256 currentTokenAToBPrice =
            _getOneTokenAPriceInTokenB(assetsIn[0], assetOut) / 10 ** (18 - ERC20(assetOut).decimals());
        uint256 suppliedAmount = (assetIn0Balance * currentTokenAToBPrice) / 10 ** ERC20(assetsIn[0]).decimals();
        uint256 amountToBorrow = (suppliedAmount * amountRatio) / 10_000;

        // borrow
        require(CErc20Interface(assetsIn[2]).borrow(amountToBorrow) == 0, "borrow failed");

        address[] memory assets = new address[](1);
        assets[0] = assetsIn[1];

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = assetIn1Balance;

        address[] memory underlyingTokens = new address[](1);
        underlyingTokens[0] = assetsIn[0];

        uint256[] memory underlyingAmounts = new uint256[](1);
        underlyingAmounts[0] = amountToBorrow;

        // transfer tokens to Strategy Module
        require(_transferToken(assetOut, amountToBorrow), "Invalid token amount");

        // update user token balance
        strategyModule.updateUserTokenBalance(strategyId, userAddress, assetOut, amountToBorrow, 0);

        return (COMPTROLLER, assets, amounts, assetOut, amountToBorrow, underlyingTokens, underlyingAmounts);
    }

    function _repayBorrowToken(
        address[] memory assetsIn,
        address assetOut,
        bytes32 strategyId,
        address userAddress,
        uint256 stepIndex
    )
        internal
        returns (address, address[] memory, uint256[] memory, address, uint256, address[] memory, uint256[] memory)
    {
        // expects 3 assetsIn: e.g [token(cbBtc), collateralToken(mw_cbBtc), borrowMwContract(mw_usdc)]

        // get borrowed token balance
        IFluidStrategy.ShareBalance memory userShareBalance =
            strategyModule.getUserShareBalance(strategyId, userAddress, COMPTROLLER, assetsIn[0], stepIndex);
        uint256 btBalance = userShareBalance.shareAmount;

        uint256 currentTokenBalance = strategyModule.getUserTokenBalance(strategyId, userAddress, assetsIn[0]);

        // get collateral token balance
        uint256 ctBalance = strategyModule.getUserTokenBalance(strategyId, userAddress, assetsIn[0]);

        require(btBalance - 1 <= currentTokenBalance, "borrow amount less than user balance");

        // update user token balance before transfer
        strategyModule.updateUserTokenBalance(strategyId, userAddress, assetsIn[0], btBalance - 1, 1);

        // transfer token from Strategy Module
        require(strategyModule.transferToken(assetsIn[0], btBalance), "not enough borrowed token");

        // repay
        ERC20(assetsIn[0]).approve(assetsIn[2], btBalance);
        require(CErc20Interface(assetsIn[2]).repayBorrow(btBalance) == 0, "repay borrow failed");

        // exit market
        require(ComptrollerInterface(COMPTROLLER).exitMarket(assetsIn[1]) == 0, "exit market failed");

        return (COMPTROLLER, new address[](0), new uint256[](0), address(0), 0, new address[](0), new uint256[](0));
    }

    function _withdrawToken(
        address[] memory assetsIn,
        address assetOut,
        bytes32 strategyId,
        address userAddress,
        uint256 stepIndex
    )
        internal
        returns (address, address[] memory, uint256[] memory, address, uint256, address[] memory, uint256[] memory)
    {
        // get share token balance
        uint256 stBalance = strategyModule.getUserTokenBalance(strategyId, userAddress, assetsIn[0]);

        // get underlying token balance
        address[] memory assets = new address[](1);
        assets[0] = assetOut;

        IFluidStrategy.AssetBalance memory userAssetBalance =
            strategyModule.getUserAssetBalance(strategyId, userAddress, assets, stepIndex);
        uint256 utBalance = userAssetBalance.amounts[0];

        uint256 tokenBalanceBefore = ERC20(assetOut).balanceOf(address(this));

        // redeem
        ERC20(assetsIn[0]).approve(assetsIn[0], stBalance);
        require(CErc20Interface(assetsIn[0]).redeem(stBalance) == 0, "redeem failed");

        // update user token balance
        strategyModule.updateUserTokenBalance(strategyId, userAddress, assetsIn[0], stBalance, 1);

        uint256 tokenBalanceDiff = ERC20(assetOut).balanceOf(address(this)) - tokenBalanceBefore;

        // check that final withdraw amount is less than or equals initial deposit
        require(tokenBalanceDiff <= utBalance, "amount more than initial deposit");

        // transfer token to Strategy Module
        require(_transferToken(assetOut, tokenBalanceDiff), "Invalid token amount");

        // update user token balance
        strategyModule.updateUserTokenBalance(strategyId, userAddress, assetOut, tokenBalanceDiff, 0);

        return (
            COMPTROLLER,
            new address[](0),
            new uint256[](0),
            assetOut,
            tokenBalanceDiff,
            new address[](0),
            new uint256[](0)
        );
    }

    // Helper function
    function _transferToken(address _token, uint256 _amount) internal returns (bool) {
        return ERC20(_token).transfer(address(strategyModule), _amount);
    }

    function _getOneTokenAPriceInTokenB(address _tokenA, address _tokenB) internal view returns (uint256) {
        (int256 _tokenAPriceInUsd, int256 _tokenBPriceInUsd) = _tokenAandTokenBPriceInUsd(_tokenA, _tokenB);

        return oracle.getTokenAPriceInTokenB(uint256(_tokenAPriceInUsd), 8, uint256(_tokenBPriceInUsd), 8);
    }

    function _tokenAandTokenBPriceInUsd(address _tokenA, address _tokenB) internal view returns (int256, int256) {
        int256 _tokenAPriceInUsd;
        int256 _tokenBPriceInUsd;

        // Get tokenA price in USD
        if (_tokenA == SFLR) _tokenAPriceInUsd = oracle.getLatestAnswer(FLR_USD_FEED);
        if (_tokenA == BTC) _tokenAPriceInUsd = oracle.getLatestAnswer(BTC_USD_FEED);
        if (_tokenA == ETH) _tokenAPriceInUsd = oracle.getLatestAnswer(ETH_USD_FEED);
        if (_tokenA == USDC) _tokenAPriceInUsd = oracle.getLatestAnswer(USDC_USD_FEED);
        if (_tokenA == USDT) _tokenAPriceInUsd = oracle.getLatestAnswer(USDT_USD_FEED);
        if (_tokenA == USDT0) _tokenAPriceInUsd = oracle.getLatestAnswer(USDT_USD_FEED);

        // Get tokenB price in USD
        if (_tokenB == SFLR) _tokenBPriceInUsd = oracle.getLatestAnswer(FLR_USD_FEED);
        if (_tokenB == BTC) _tokenBPriceInUsd = oracle.getLatestAnswer(BTC_USD_FEED);
        if (_tokenB == ETH) _tokenBPriceInUsd = oracle.getLatestAnswer(ETH_USD_FEED);
        if (_tokenB == USDC) _tokenBPriceInUsd = oracle.getLatestAnswer(USDC_USD_FEED);
        if (_tokenB == USDT) _tokenBPriceInUsd = oracle.getLatestAnswer(USDT_USD_FEED);
        if (_tokenB == USDT0) _tokenBPriceInUsd = oracle.getLatestAnswer(USDT_USD_FEED);

        return (_tokenAPriceInUsd, _tokenBPriceInUsd);
    }

    // receive() external payable {
    //     require(msg.sender == SFLR_UNWRAPPER, "not accepting eth");

    //     IWETH9(SFLR).deposit{value: msg.value}();
    // }
}