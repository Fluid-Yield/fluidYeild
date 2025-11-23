// SPDX-License-Identifier: GNU
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import "../src/interfaces/IConnector.sol";

import {Strategy} from "../src/strategy.sol";
import {Oracle} from "../src/oracle.sol";
import {Engine} from "../src/engine.sol";

// connectors
import {KineticConnector} from "../src/connectors/lending/Kinetic.sol";
import {SparkDexV2Connector} from "../src/connectors/dex/SparkDex/v2.sol";
import {SparkDexV3Connector} from "../src/connectors/dex/SparkDex/v3.sol";


contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        Engine engine = new Engine();
        Strategy strategy = new Strategy(address(engine));

        Oracle oracle = new Oracle();

        address SparkDexV2Router = address(0x1234567890123456789012345678901234567890); // Todo: find testnet router address
        address SparkDexV3Router = address(0x1234567890123456789012345678901234567891); // Todo: find testnet router address

        KineticConnector kineticConnector = new KineticConnector(
            "Kinetic Connector", IConnector.ConnectorType.LENDING, address(strategy), address(engine), address(oracle)
        );

        SparkDexV2Connector sparkDexV2Connector = new SparkDexV2Connector(
            "SparkDex V2 Connector", IConnector.ConnectorType.DEX, address(strategy), address(engine), address(oracle), SparkDexV2Router
        );

        SparkDexV3Connector sparkDexV3Connector = new SparkDexV3Connector(
            "SparkDex V3 Connector", IConnector.ConnectorType.DEX, address(strategy), address(engine), address(oracle), SparkDexV3Router
        );

        vm.stopBroadcast();
    }
}


