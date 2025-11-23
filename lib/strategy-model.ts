import { z } from "zod";

export const tokenSymbolSchema = z.enum([
  "FLR",
  "SFLR",
  "FXRP",
  "USDC",
  "USDT",
  "USDT0",
]);

export const actionTypeSchema = z.literal("SWAP");

export const riskLevelSchema = z.enum(["low", "medium", "high"]);

export const strategyStepSchema = z.object({
  action: actionTypeSchema,
  // For SWAP actions, outputToken is required and must be a supported token.
  outputToken: tokenSymbolSchema,
  // Kept for backwards compatibility; always null for new strategies.
  marketToken: z.string().nullable(),
  // Optional human readable description of the step.
  label: z.string().nullable(),
});

export const strategyFromAiSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  summary: z.string().min(1),
  riskLevel: riskLevelSchema,
  inputToken: tokenSymbolSchema,
  steps: z.array(strategyStepSchema).min(1).max(10),
});

export type StrategyFromAi = z.infer<typeof strategyFromAiSchema>;
export type StrategyStepFromAi = z.infer<typeof strategyStepSchema>;
