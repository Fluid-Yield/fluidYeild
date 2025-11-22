import { NextRequest, NextResponse } from "next/server";

import { AI_MODEL_ID, ANON_USER_COOKIE } from "@/lib/constants";
import { strategyFromAiSchema } from "@/lib/strategy-model";
import { db, strategies } from "@/db/client";
import { ensureUser } from "@/db/user";

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get(ANON_USER_COOKIE);

  if (!cookie) {
    return NextResponse.json({ error: "Missing user cookie" }, { status: 400 });
  }

  const userId = cookie.value;
  await ensureUser(userId);

  const body = await req.json();
  const vaultStrategyId = body?.vaultStrategyId as number | undefined;
  const prompt = body?.prompt as string | undefined;
  const strategyJson = body?.strategy;

  if (!vaultStrategyId || !prompt || !strategyJson) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const parsed = strategyFromAiSchema.safeParse(strategyJson);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid strategy payload" }, { status: 400 });
  }

  const strategy = parsed.data;

  const [inserted] = await db
    .insert(strategies)
    .values({
      userId,
      vaultStrategyId,
      name: strategy.name,
      description: strategy.description,
      summary: strategy.summary,
      riskLevel: strategy.riskLevel,
      inputToken: strategy.inputToken,
      aiModel: AI_MODEL_ID,
      aiRequest: prompt,
      aiResponse: JSON.stringify(strategy),
    })
    .returning({ id: strategies.id });

  return NextResponse.json({ id: inserted?.id ?? null });
}
