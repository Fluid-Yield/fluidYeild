import deployed from "./contracts/deployed-addresses.json";
import StrategyArtifact from "./contracts/abis/Strategy.json";
import EngineArtifact from "./contracts/abis/Engine.json";
import KineticConnectorArtifact from "./contracts/abis/KineticConnector.json";
import SparkDexV2ConnectorArtifact from "./contracts/abis/SparkDexV2Connector.json";
import SparkDexV3ConnectorArtifact from "./contracts/abis/SparkDexV3Connector.json";

const strategyAbi = StrategyArtifact.abi;
const engineAbi = EngineArtifact.abi;
const kineticConnectorAbi = KineticConnectorArtifact.abi;
const sparkDexV2ConnectorAbi = SparkDexV2ConnectorArtifact.abi;
const sparkDexV3ConnectorAbi = SparkDexV3ConnectorArtifact.abi;

type DeployedFileShape = {
  contracts: {
    Engine: string;
    Strategy: string;
    Oracle: string;
    KineticConnector: string;
    SparkDexV2Connector: string;
    SparkDexV3Connector: string;
  };
};

const contracts = (deployed as DeployedFileShape).contracts;

export const fyContracts = {
  engine: {
    address: contracts.Engine as `0x${string}`,
    abi: engineAbi,
  },
  strategy: {
    address: contracts.Strategy as `0x${string}`,
    abi: strategyAbi,
  },
  connectors: {
    kinetic: {
      address: contracts.KineticConnector as `0x${string}`,
      abi: kineticConnectorAbi,
    },
    sparkDexV2: {
      address: contracts.SparkDexV2Connector as `0x${string}`,
      abi: sparkDexV2ConnectorAbi,
    },
    sparkDexV3: {
      address: contracts.SparkDexV3Connector as `0x${string}`,
      abi: sparkDexV3ConnectorAbi,
    },
  },
} as const;
