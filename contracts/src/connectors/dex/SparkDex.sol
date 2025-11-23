// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../../interfaces/IConnector.sol";
import "../../interfaces/IStrategy.sol";
import "../../interfaces/IEngine.sol";
import "../../interfaces/IOracle.sol";
import "../constant.sol";

interface ISparkDexV2Router {
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);
}

interface ISparkDexV3Router {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }

    function exactInputSingle(ExactInputSingleParams calldata params) external payable returns (uint256 amountOut);
}

abstract contract SparkDexBaseConnector is IConnector, Constants {
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

    error InvalidAction();
    error InsufficientAmountIn();

    constructor(
        string memory _name,
        ConnectorType _type,
        address _strategy,
        address _engine,
        address _oracle
    ) {
        connectorName = keccak256(bytes(_name));
        connectorType = _type;
        strategyModule = IFluidStrategy(_strategy);
        engine = IEngine(_engine);
        oracle = IOracle(_oracle);
    }

    modifier onlyEngine() {
        require(msg.sender == address(engine), "caller is not the execution engine");
        _;
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

    function execute(
        ActionType actionType,
        address[] memory assetsIn,
        address assetOut,
        uint256 stepIndex,
        uint256 amountRatio,
        bytes32 strategyId,
        address userAddress,
        bytes calldata data
    )
        external
        payable
        override
        onlyEngine
        returns (
            address protocol,
            address[] memory assets,
            uint256[] memory assetsAmount,
            address shareToken,
            uint256 shareAmount,
            address[] memory underlyingTokens,
            uint256[] memory underlyingAmounts
        )
    {
        if (actionType != ActionType.SWAP) {
            revert InvalidAction();
        }

        return _swap(assetsIn, assetOut, amountRatio, strategyId, userAddress, data);
    }

    function initialTokenBalanceUpdate(bytes32 strategyId, address userAddress, address token, uint256 amount)
        external
        onlyEngine
    {
        strategyModule.updateUserTokenBalance(strategyId, userAddress, token, amount, 0);
    }

    function withdrawAsset(bytes32 _strategyId, address _user, address _token) external onlyEngine returns (bool) {
        uint256 tokenBalance = strategyModule.getUserTokenBalance(_strategyId, _user, _token);

        require(strategyModule.transferToken(_token, tokenBalance), "Not enough tokens for withdrawal");
        return ERC20(_token).transfer(_user, tokenBalance);
    }

    function _transferToken(address _token, uint256 _amount) internal returns (bool) {
        return ERC20(_token).transfer(address(strategyModule), _amount);
    }

    function _prepareSwap(
        address tokenIn,
        uint256 amountRatio,
        bytes32 strategyId,
        address userAddress
    ) internal returns (uint256 amountIn) {
        uint256 balanceIn = strategyModule.getUserTokenBalance(strategyId, userAddress, tokenIn);
        amountIn = (balanceIn * amountRatio) / 10_000;
        if (amountIn == 0) {
            revert InsufficientAmountIn();
        }

        require(strategyModule.transferToken(tokenIn, amountIn), "Not enough token");
        strategyModule.updateUserTokenBalance(strategyId, userAddress, tokenIn, amountIn, 1);
    }

    function _finalizeSwap(
        address protocol,
        address tokenIn,
        address tokenOut,
        bytes32 strategyId,
        address userAddress,
        uint256 amountIn,
        uint256 amountOut
    )
        internal
        returns (
            address,
            address[] memory,
            uint256[] memory,
            address,
            uint256,
            address[] memory,
            uint256[] memory
        )
    {
        require(_transferToken(tokenOut, amountOut), "Invalid token amount");
        strategyModule.updateUserTokenBalance(strategyId, userAddress, tokenOut, amountOut, 0);

        address[] memory assets = new address[](1);
        assets[0] = tokenIn;

        uint256[] memory assetsAmount = new uint256[](1);
        assetsAmount[0] = amountIn;

        address[] memory underlyingTokens = new address[](1);
        underlyingTokens[0] = tokenOut;

        uint256[] memory underlyingAmounts = new uint256[](1);
        underlyingAmounts[0] = amountOut;

        return (protocol, assets, assetsAmount, address(0), 0, underlyingTokens, underlyingAmounts);
    }

    function _swap(
        address[] memory assetsIn,
        address assetOut,
        uint256 amountRatio,
        bytes32 strategyId,
        address userAddress,
        bytes calldata data
    )
        internal
        virtual
        returns (
            address protocol,
            address[] memory assets,
            uint256[] memory assetsAmount,
            address shareToken,
            uint256 shareAmount,
            address[] memory underlyingTokens,
            uint256[] memory underlyingAmounts
        );
}

contract SparkDexV2Connector is SparkDexBaseConnector {
    ISparkDexV2Router public immutable router;

    constructor(
        string memory _name,
        ConnectorType _type,
        address _strategy,
        address _engine,
        address _oracle,
        address _router
    ) SparkDexBaseConnector(_name, _type, _strategy, _engine, _oracle) {
        router = ISparkDexV2Router(_router);
    }

    function _swap(
        address[] memory assetsIn,
        address assetOut,
        uint256 amountRatio,
        bytes32 strategyId,
        address userAddress,
        bytes calldata data
    )
        internal
        override
        returns (
            address,
            address[] memory,
            uint256[] memory,
            address,
            uint256,
            address[] memory,
            uint256[] memory
        )
    {
        require(assetsIn.length > 0, "invalid assetsIn");
        address tokenIn = assetsIn[0];

        (address[] memory path, uint256 minAmountOut, uint256 deadline) =
            abi.decode(data, (address[], uint256, uint256));

        require(path.length >= 2, "invalid path");
        require(path[0] == tokenIn, "path mismatch");
        require(path[path.length - 1] == assetOut, "path mismatch");

        uint256 amountIn = _prepareSwap(tokenIn, amountRatio, strategyId, userAddress);

        ERC20(tokenIn).approve(address(router), amountIn);

        uint256[] memory amounts =
            router.swapExactTokensForTokens(amountIn, minAmountOut, path, address(this), deadline);

        uint256 amountOut = amounts[amounts.length - 1];

        return _finalizeSwap(address(router), tokenIn, assetOut, strategyId, userAddress, amountIn, amountOut);
    }
}

contract SparkDexV3Connector is SparkDexBaseConnector {
    ISparkDexV3Router public immutable router;

    constructor(
        string memory _name,
        ConnectorType _type,
        address _strategy,
        address _engine,
        address _oracle,
        address _router
    ) SparkDexBaseConnector(_name, _type, _strategy, _engine, _oracle) {
        router = ISparkDexV3Router(_router);
    }

    function _swap(
        address[] memory assetsIn,
        address assetOut,
        uint256 amountRatio,
        bytes32 strategyId,
        address userAddress,
        bytes calldata data
    )
        internal
        override
        returns (
            address,
            address[] memory,
            uint256[] memory,
            address,
            uint256,
            address[] memory,
            uint256[] memory
        )
    {
        require(assetsIn.length > 0, "invalid assetsIn");
        address tokenIn = assetsIn[0];

        (uint24 fee, uint256 minAmountOut, uint256 deadline, uint160 sqrtPriceLimitX96) =
            abi.decode(data, (uint24, uint256, uint256, uint160));

        uint256 amountIn = _prepareSwap(tokenIn, amountRatio, strategyId, userAddress);

        ERC20(tokenIn).approve(address(router), amountIn);

        ISparkDexV3Router.ExactInputSingleParams memory params = ISparkDexV3Router.ExactInputSingleParams({
            tokenIn: tokenIn,
            tokenOut: assetOut,
            fee: fee,
            recipient: address(this),
            deadline: deadline,
            amountIn: amountIn,
            amountOutMinimum: minAmountOut,
            sqrtPriceLimitX96: sqrtPriceLimitX96
        });

        uint256 amountOut = router.exactInputSingle(params);

        return _finalizeSwap(address(router), tokenIn, assetOut, strategyId, userAddress, amountIn, amountOut);
    }
}