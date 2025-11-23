// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../../../interfaces/IConnector.sol";
import "../../../interfaces/IStrategy.sol";
import "../../../interfaces/IEngine.sol";
import "../../../interfaces/IOracle.sol";
import "../../constant.sol";

interface ISparkDexV2Router {
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountA, uint256 amountB, uint256 liquidity);

    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountA, uint256 amountB);
}

interface ISparkDexV2Pair {
    function token0() external view returns (address);
    function token1() external view returns (address);
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
        if (actionType == ActionType.SUPPLY) {
            return _supplyLiquidity(assetsIn, assetOut, amountRatio, strategyId, userAddress, data);
        } else if (actionType == ActionType.WITHDRAW) {
            return _withdrawLiquidity(assetsIn, assetOut, amountRatio, strategyId, userAddress, data);
        } else if (actionType == ActionType.SWAP) {
            return _swap(assetsIn, assetOut, amountRatio, strategyId, userAddress, data);
        }
        revert InvalidAction();
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

    function _supplyLiquidityPair(
        ISparkDexV2Router liquidityRouter,
        address pair,
        address[] memory assetsIn,
        uint256 amountRatio,
        bytes32 strategyId,
        address userAddress,
        bytes calldata data
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
        require(assetsIn.length == 2, "invalid assetsIn");

        address tokenA = assetsIn[0];
        address tokenB = assetsIn[1];

        address pairToken0 = ISparkDexV2Pair(pair).token0();
        address pairToken1 = ISparkDexV2Pair(pair).token1();
        require(
            (pairToken0 == tokenA && pairToken1 == tokenB)
                || (pairToken0 == tokenB && pairToken1 == tokenA),
            "pair mismatch"
        );

        uint256 balanceA = strategyModule.getUserTokenBalance(strategyId, userAddress, tokenA);
        uint256 balanceB = strategyModule.getUserTokenBalance(strategyId, userAddress, tokenB);

        uint256 amountADesired = (balanceA * amountRatio) / 10_000;
        uint256 amountBDesired = (balanceB * amountRatio) / 10_000;

        if (amountADesired == 0 && amountBDesired == 0) {
            revert InsufficientAmountIn();
        }

        require(strategyModule.transferToken(tokenA, amountADesired), "Not enough tokenA");
        require(strategyModule.transferToken(tokenB, amountBDesired), "Not enough tokenB");

        strategyModule.updateUserTokenBalance(strategyId, userAddress, tokenA, amountADesired, 1);
        strategyModule.updateUserTokenBalance(strategyId, userAddress, tokenB, amountBDesired, 1);

        ERC20(tokenA).approve(address(liquidityRouter), amountADesired);
        ERC20(tokenB).approve(address(liquidityRouter), amountBDesired);

        uint256 amountAMin;
        uint256 amountBMin;
        uint256 deadline;
        if (data.length == 0) {
            amountAMin = 0;
            amountBMin = 0;
            deadline = block.timestamp;
        } else {
            (amountAMin, amountBMin, deadline) = abi.decode(data, (uint256, uint256, uint256));
        }

        (uint256 amountAUsed, uint256 amountBUsed, uint256 liquidity) = liquidityRouter.addLiquidity(
            tokenA,
            tokenB,
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin,
            address(this),
            deadline
        );

        uint256 refundA = amountADesired - amountAUsed;
        uint256 refundB = amountBDesired - amountBUsed;

        if (refundA > 0) {
            require(_transferToken(tokenA, refundA), "refund A failed");
            strategyModule.updateUserTokenBalance(strategyId, userAddress, tokenA, refundA, 0);
        }
        if (refundB > 0) {
            require(_transferToken(tokenB, refundB), "refund B failed");
            strategyModule.updateUserTokenBalance(strategyId, userAddress, tokenB, refundB, 0);
        }

        require(_transferToken(pair, liquidity), "transfer lp failed");
        strategyModule.updateUserTokenBalance(strategyId, userAddress, pair, liquidity, 0);

        address[] memory assets = new address[](2);
        assets[0] = tokenA;
        assets[1] = tokenB;

        uint256[] memory assetsAmount = new uint256[](2);
        assetsAmount[0] = amountAUsed;
        assetsAmount[1] = amountBUsed;

        address[] memory underlyingTokens = new address[](2);
        underlyingTokens[0] = tokenA;
        underlyingTokens[1] = tokenB;

        uint256[] memory underlyingAmounts = new uint256[](2);
        underlyingAmounts[0] = amountAUsed;
        underlyingAmounts[1] = amountBUsed;

        return (address(liquidityRouter), assets, assetsAmount, pair, liquidity, underlyingTokens, underlyingAmounts);
    }

    function _withdrawLiquidityPair(
        ISparkDexV2Router liquidityRouter,
        address lpToken,
        uint256 amountRatio,
        bytes32 strategyId,
        address userAddress,
        bytes calldata data
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
        uint256 lpBalance = strategyModule.getUserTokenBalance(strategyId, userAddress, lpToken);
        uint256 ratio = amountRatio == 0 ? 10_000 : amountRatio;
        uint256 liquidity = (lpBalance * ratio) / 10_000;
        if (liquidity == 0) {
            revert InsufficientAmountIn();
        }

        require(strategyModule.transferToken(lpToken, liquidity), "Not enough lp");
        strategyModule.updateUserTokenBalance(strategyId, userAddress, lpToken, liquidity, 1);

        address tokenA = ISparkDexV2Pair(lpToken).token0();
        address tokenB = ISparkDexV2Pair(lpToken).token1();

        ERC20(lpToken).approve(address(liquidityRouter), liquidity);

        uint256 amountAMin;
        uint256 amountBMin;
        uint256 deadline;
        if (data.length == 0) {
            amountAMin = 0;
            amountBMin = 0;
            deadline = block.timestamp;
        } else {
            (amountAMin, amountBMin, deadline) = abi.decode(data, (uint256, uint256, uint256));
        }

        (uint256 amountA, uint256 amountB) = liquidityRouter.removeLiquidity(
            tokenA,
            tokenB,
            liquidity,
            amountAMin,
            amountBMin,
            address(this),
            deadline
        );

        require(_transferToken(tokenA, amountA), "transfer A failed");
        require(_transferToken(tokenB, amountB), "transfer B failed");

        strategyModule.updateUserTokenBalance(strategyId, userAddress, tokenA, amountA, 0);
        strategyModule.updateUserTokenBalance(strategyId, userAddress, tokenB, amountB, 0);

        address[] memory assets = new address[](1);
        assets[0] = lpToken;

        uint256[] memory assetsAmount = new uint256[](1);
        assetsAmount[0] = liquidity;

        address[] memory underlyingTokens = new address[](2);
        underlyingTokens[0] = tokenA;
        underlyingTokens[1] = tokenB;

        uint256[] memory underlyingAmounts = new uint256[](2);
        underlyingAmounts[0] = amountA;
        underlyingAmounts[1] = amountB;

        return (address(liquidityRouter), assets, assetsAmount, address(0), 0, underlyingTokens, underlyingAmounts);
    }

    function _supplyLiquidity(
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

    function _withdrawLiquidity(
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

