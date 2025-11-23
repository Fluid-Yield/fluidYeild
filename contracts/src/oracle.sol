// SPDX-License-Identifier: GNU
pragma solidity ^0.8.20;

import "./interfaces/IOracle.sol";

import {TestFtsoV2Interface} from "flare-periphery/coston2/TestFtsoV2Interface.sol";
import {ContractRegistry} from "flare-periphery/coston2/ContractRegistry.sol";
import {IFeeCalculator} from "flare-periphery/coston2/IFeeCalculator.sol";

    
contract Oracle {
    error SequencerDown();
    error GracePeriodNotOver();

    /**
     * @notice function to get the price of token in USD
     * @param _dataFeed data feed address on base network
     */
    function getLatestAnswer(bytes21 _dataFeed) public view returns (int256) {
        TestFtsoV2Interface ftsoV2 = ContractRegistry.getTestFtsoV2();
        (uint256 price, int8 decimals, ) = ftsoV2.getFeedById(_dataFeed);

        return int256(price) * int256(10 ** (8 - uint256(uint8(decimals)))); // returns usd value scaled to 8 decimal
    }

    /**
     * @dev Calculates the price of 1 tokenA in terms of tokenB, normalizing decimal differences.
     * @param tokenAPriceInUsd The price of 1 tokenA in USD.
     * @param tokenAPriceDecimals The number of decimals in the tokenA price.
     * @param tokenBPriceInUsd The price of 1 tokenB in USD.
     * @param tokenBPriceDecimals The number of decimals in the tokenB price.
     */
    function getTokenAPriceInTokenB(
        uint256 tokenAPriceInUsd,
        uint8 tokenAPriceDecimals,
        uint256 tokenBPriceInUsd,
        uint8 tokenBPriceDecimals
    ) public pure returns (uint256) {
        require(tokenAPriceInUsd > 0, "tokenA price must be greater than zero");
        require(tokenBPriceInUsd > 0, "tokenB price must be greater than zero");

        // Normalize to the same decimal scale
        if (tokenAPriceDecimals > tokenBPriceDecimals) {
            tokenBPriceInUsd *= 10 ** (tokenAPriceDecimals - tokenBPriceDecimals);
        } else if (tokenBPriceDecimals > tokenAPriceDecimals) {
            tokenAPriceInUsd *= 10 ** (tokenBPriceDecimals - tokenAPriceDecimals);
        }

        // Calculate price: (tokenA / tokenB)
        return (tokenAPriceInUsd * 1e18) / tokenBPriceInUsd; // Returns result scaled to 18 decimals
    }
}
