// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

/// @title Constants
/// @notice Abstract contract containing constant addresses for common DeFi protocols and tokens
/// @dev Inherit from this contract to access these addresses in your contracts
abstract contract Constants {
    // Ethereum
    address internal constant ETH_ADDRESS = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    address internal constant SFLR = 0x4200000000000000000000000000000000000006;

    bytes21 internal constant FLR_USD_FEED = 0x01464c522f55534400000000000000000000000000;
    bytes21 internal constant BTC_USD_FEED = 0x014254432f55534400000000000000000000000000;
    bytes21 internal constant XRP_USD_FEED = 0x015852502f55534400000000000000000000000000;
    bytes21 internal constant ETH_USD_FEED = 0x014554482f55534400000000000000000000000000;
    bytes21 internal constant USDC_USD_FEED = 0x01555344432f555344000000000000000000000000;
    bytes21 internal constant USDT_USD_FEED = 0x01555344542f555344000000000000000000000000;

    // Tokens
    address internal constant BTC = 0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf;
    address internal constant FXRP = 0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb;
    address internal constant ETH = 0x4200000000000000000000000000000000000006;
    address internal constant USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    address internal constant USDT = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    address internal constant USDT0 = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;

    // Oracle
    address internal constant ORACLE = 0x333Cd307bd0d8fDB3c38b14eacC4072FF548176B; //TODO: deploy and replace
    address internal constant ENGINE = 0xe7D11A96aB3813D8232a0711D4fa4f60E2f50B19; //TODO: Deploy and replace

    // Kinetic Basic contracts
    address internal constant COMPTROLLER = 0x0f8f2f0fe32D8BdEceCC2eA966cd30b155f62B6d; // flare testnet
    address internal constant SFLR_UNWRAPPER = 0x1382cFf3CeE10D283DccA55A30496187759e4cAf;

    /// @dev Liquidity slippage tolerance: 0.5%
    // 3% for testing
    // 10000 = 100%, 5000 = 50%, 100 = 1%, 1 = 0.01%
    uint256 internal constant LIQ_SLIPPAGE = 300;
    /// @dev 10 ** 18
    uint256 internal constant WAD = 1e18;
    /// @dev 10 ** 27
    uint256 internal constant RAY = 1e27;
}
