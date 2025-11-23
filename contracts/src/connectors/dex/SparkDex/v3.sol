// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Base.sol";

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

    function _supplyLiquidity(
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
        ISparkDexV2Router liquidityRouter = ISparkDexV2Router(address(router));
        return _supplyLiquidityPair(liquidityRouter, assetOut, assetsIn, amountRatio, strategyId, userAddress, data);
    }

    function _withdrawLiquidity(
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
        assetOut;
        require(assetsIn.length > 0, "invalid assetsIn");

        address lpToken = assetsIn[0];
        ISparkDexV2Router liquidityRouter = ISparkDexV2Router(address(router));
        return _withdrawLiquidityPair(liquidityRouter, lpToken, amountRatio, strategyId, userAddress, data);
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
