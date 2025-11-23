import { encodeAbiParameters } from "viem";

import { TOKENS, TokenKey } from "./tokens";
import { StrategyFromAi } from "./strategy-model";
import { fyContracts } from "./contracts";

const SWAP_ACTION_TYPE = 6;
const MAX_BPS = 10_000;

export type EncodedStep = {
  connector: `0x${string}`;
  actionType: number;
  assetsIn: `0x${string}`[];
  assetOut: `0x${string}`;
  amountRatio: bigint;
  data: `0x${string}`;
};

export function buildStepsFromAi(strategy: StrategyFromAi): EncodedStep[] {
  const inputKey = strategy.inputToken as TokenKey;
  const input = TOKENS[inputKey];

  if (!input) {
    throw new Error(`Unknown inputToken ${strategy.inputToken}`);
  }

  const connector = fyContracts.connectors.sparkDexV2.address;

  let currentTokenAddress = input.address;
  const steps: EncodedStep[] = [];

  for (const step of strategy.steps) {
    const outKey = step.outputToken as TokenKey;
    const outToken = TOKENS[outKey];

    if (!outToken) {
      throw new Error(`Unknown outputToken ${step.outputToken}`);
    }

    if (outToken.address.toLowerCase() === currentTokenAddress.toLowerCase()) {
      continue;
    }

    const path = [currentTokenAddress, outToken.address];
    const minAmountOut = BigInt(0);
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 60);

    const data = encodeAbiParameters(
      [
        { name: "path", type: "address[]" },
        { name: "minAmountOut", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
      [path, minAmountOut, deadline]
    );

    steps.push({
      connector,
      actionType: SWAP_ACTION_TYPE,
      assetsIn: [currentTokenAddress],
      assetOut: outToken.address,
      amountRatio: BigInt(MAX_BPS),
      data,
    });

    currentTokenAddress = outToken.address;
  }

  return steps;
}
