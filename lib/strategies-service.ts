"use server";

import { createPublicClient, http } from "viem";
import { inArray, eq } from "drizzle-orm";

import { fyChain, fyRpcUrl } from "./chain";
import { fyContracts } from "./contracts";
import { StrategyCardProps } from "../app/types/strategy-types";
import { db, strategies, wallets } from "@/db/client";
import { strategyFromAiSchema, type StrategyFromAi } from "./strategy-model";

const client = createPublicClient({
  chain: fyChain,
  transport: http(fyRpcUrl),
});

export interface StrategyOverview {
  id: string;
  name: string;
  curator: string;
  inputToken: string;
  stepCount: number;
  ai?: {
    description: string | null;
    summary: string | null;
    riskLevel: string | null;
  } | null;
}

export async function getAllStrategiesWithAi(): Promise<StrategyOverview[]> {
  const allStrategies = (await client.readContract({
    abi: fyContracts.strategy.abi,
    address: fyContracts.strategy.address,
    functionName: "getAllStrategies",
  })) as readonly {
    strategyId: `0x${string}`;
    curator: `0x${string}`;
    name: string;
    strategyDescription: string;
    steps: readonly {
      connector: `0x${string}`;
      actionType: bigint;
      assetsIn: readonly `0x${string}`[];
      assetOut: `0x${string}`;
      amountRatio: bigint;
      data: `0x${string}`;
    }[];
    minDeposit: bigint;
  }[];

  if (!allStrategies.length) return [];

  const onchain = allStrategies.map((s) => {
    const firstStep = s.steps[0];
    const inputToken = firstStep?.assetsIn[0] ??
      "0x0000000000000000000000000000000000000000";

    return {
      id: s.strategyId,
      name: s.name,
      curator: s.curator,
      inputToken,
      stepCount: s.steps.length,
    } satisfies StrategyOverview;
  });

  const strategyIds = onchain.map((s) => s.id);

  if (!strategyIds.length) return onchain;

  const aiRows = await db
    .select()
    .from(strategies)
    .where(inArray(strategies.strategyId, strategyIds));

  const byId = new Map<string, (typeof aiRows)[number]>();

  for (const row of aiRows) {
    if (!row.strategyId) continue;
    if (!byId.has(row.strategyId)) {
      byId.set(row.strategyId, row);
    }
  }

  return onchain.map((s) => {
    const meta = byId.get(s.id);
    return {
      ...s,
      ai: meta
        ? {
            description: meta.description,
            summary: meta.summary,
            riskLevel: meta.riskLevel,
          }
        : null,
    } satisfies StrategyOverview;
  });
}

export async function getUserStrategiesByUserId(userId: string | null) {
  if (!userId)
    return {
      created: [] as StrategyOverview[],
      joined: [] as StrategyOverview[],
    };

  const walletRows = await db
    .select({ address: wallets.address })
    .from(wallets)
    .where(eq(wallets.userId, userId));

  if (!walletRows.length) {
    return {
      created: [] as StrategyOverview[],
      joined: [] as StrategyOverview[],
    };
  }

  const all = await getAllStrategiesWithAi();

  const addresses = walletRows
    .map((w) => w.address)
    .filter((a): a is `0x${string}` => !!a) as `0x${string}`[];
  const addressSet = new Set(addresses.map((a) => a.toLowerCase()));

  const created = all.filter((s) =>
    addressSet.has(s.curator.toLowerCase())
  );

  const joinedIdSet = new Set<string>();

  for (const addr of addresses) {
    const ids = (await client.readContract({
      abi: fyContracts.strategy.abi,
      address: fyContracts.strategy.address,
      functionName: "getUserStrategies",
      args: [addr],
    })) as readonly `0x${string}`[];

    ids.forEach((id) => joinedIdSet.add(id.toLowerCase()));
  }

  const joined = all.filter((s) => joinedIdSet.has(s.id.toLowerCase()));

  return { created, joined };
}

export async function toStrategyCardProps(
  s: StrategyOverview
): Promise<StrategyCardProps> {
  const ai = s.ai;
  const description =
    ai?.summary ||
    ai?.description ||
    "On-chain strategy created in the Nir vault.";

  const risk = ai?.riskLevel
    ? ai.riskLevel.charAt(0).toUpperCase() + ai.riskLevel.slice(1)
    : "Unknown";

  const creatorShort = `${s.curator.slice(0, 6)}...${s.curator.slice(-4)}`;

  return {
    title: s.name,
    type: ai ? "AI Strategy" : "On-chain Strategy",
    creator: creatorShort,
    description,
    performance: "N/A",
    risk,
    href: `/dashboard/strategies/${s.id}`,
  };
}

export interface StrategyDetail {
  overview: StrategyOverview;
  ai?: StrategyFromAi | null;
}

export async function getStrategyDetail(
  id: string
): Promise<StrategyDetail | null> {
  const all = await getAllStrategiesWithAi();
  const base = all.find((s) => s.id === id);

  if (!base) return null;

  const rows = await db
    .select()
    .from(strategies)
    .where(eq(strategies.strategyId, id))
    .limit(1);

  const row = rows[0];

  if (!row?.aiResponse) {
    return { overview: base, ai: null };
  }

  let parsed: StrategyFromAi | null = null;

  try {
    const json = JSON.parse(row.aiResponse);
    let result = strategyFromAiSchema.safeParse(json);

    if (!result.success) {
      const baseJson = json as { steps?: unknown } | null;
      const normalized =
        baseJson && typeof baseJson === "object"
          ? {
              ...baseJson,
              steps: Array.isArray(baseJson.steps)
                ? baseJson.steps.map((step) => {
                    const s = step as {
                      outputToken?: string | null;
                      marketToken?: string | null;
                      label?: string | null;
                      [key: string]: unknown;
                    };
                    return {
                      ...s,
                      outputToken: s.outputToken ?? null,
                      marketToken: s.marketToken ?? null,
                      label: s.label ?? null,
                    };
                  })
                : [],
            }
          : json;

      result = strategyFromAiSchema.safeParse(normalized);
    }

    if (result.success) {
      parsed = result.data;
    }
  } catch {
    parsed = null;
  }

  return { overview: base, ai: parsed };
}
