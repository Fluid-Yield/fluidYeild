import { NextRequest, NextResponse } from "next/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateObject } from "ai";

import { AI_MODEL_ID, ANON_USER_COOKIE } from "@/lib/constants";
import { strategyFromAiSchema } from "@/lib/strategy-model";
import { db, chatMessages } from "@/db/client";
import { ensureUser } from "@/db/user";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY ?? "",
});

export async function POST(req: NextRequest) {
  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY is not configured" },
      { status: 500 }
    );
  }

  const body = await req.json();
  const userPrompt = body?.prompt as string | undefined;

  if (!userPrompt) {
    return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
  }

  const cookie = req.cookies.get(ANON_USER_COOKIE);

  if (!cookie) {
    return NextResponse.json({ error: "Missing user cookie" }, { status: 400 });
  }

  const userId = cookie.value;

  await ensureUser(userId);

  const system = [
    "You generate DeFi strategies for the Fluid Yield dapp.",
    "All strategies MUST target the Flare custom2 testnet using the Strategy module (definitions) and Engine contract (execution).",
    "You MUST NOT mention BNB Chain, BNB, WBNB, BUSD, Venus, or a StrategyVault contract anywhere in the response.",
    "You must output JSON only, matching the provided schema.",
    "Allowed inputToken symbols: FLR, SFLR, FXRP, USDC, USDT, USDT0.",
    "Allowed step actions: SWAP.",
    "For SWAP steps, outputToken must be one of: FLR, SFLR, FXRP, USDC, USDT, USDT0, and it must differ from the current token to avoid no-op swaps.",
    "If the user requests an unsupported token, map it to the closest allowed token and STILL produce a valid strategy. Never respond with an error strategy or 'unsupported token' message.",
    "Use no more than 10 steps, and each step must be a meaningful DeFi action on the allowed tokens.",
  ].join(" ");

  const { object } = await generateObject({
    model: openrouter.chat(AI_MODEL_ID),
    schema: strategyFromAiSchema,
    prompt: `${system}\n\nUser request: ${userPrompt}`,
  });

  const strategy = strategyFromAiSchema.parse(object);

  await db.insert(chatMessages).values({
    userId,
    role: "user",
    content: userPrompt,
  });

  await db.insert(chatMessages).values({
    userId,
    role: "assistant",
    content: JSON.stringify(strategy),
  });

  return NextResponse.json({ strategy });
}
