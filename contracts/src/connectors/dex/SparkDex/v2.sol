// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Base.sol";

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
        return _supplyLiquidityPair(router, assetOut, assetsIn, amountRatio, strategyId, userAddress, data);
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
        return _withdrawLiquidityPair(router, lpToken, amountRatio, strategyId, userAddress, data);
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