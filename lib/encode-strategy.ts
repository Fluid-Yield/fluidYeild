import { encodeAbiParameters } from "viem";

import { TOKENS, VTOKENS, TokenKey, VTokenKey } from "./tokens";
import { StrategyFromAi } from "./strategy-model";

export enum ActionOrdinal {
  SWAP = 0,
  SUPPLY = 1,
  BORROW = 2,
  WITHDRAW = 3,
  REDEEM = 4,
}

export function buildStepsFromAi(strategy: StrategyFromAi) {
  return strategy.steps.map((step) => {
    if (step.action === "SWAP") {
      const key = step.outputToken as TokenKey;
      const token = TOKENS[key];

      if (!token) {
        throw new Error(`Unknown outputToken ${step.outputToken}`);
      }

      const params = encodeAbiParameters(
        [{ name: "tokenOut", type: "address" }],
        [token.address]
      );

      return { action: ActionOrdinal.SWAP, params };
    }

    const vKey = step.marketToken as VTokenKey;
    const vToken = VTOKENS[vKey];

    if (!vToken) {
      throw new Error(`Unknown marketToken ${step.marketToken}`);
    }

    const action =
      step.action === "SUPPLY"
        ? ActionOrdinal.SUPPLY
        : step.action === "WITHDRAW"
        ? ActionOrdinal.WITHDRAW
        : ActionOrdinal.REDEEM;

    const params = encodeAbiParameters(
      [{ name: "marketToken", type: "address" }],
      [vToken.address]
    );

    return { action, params };
  });
}
