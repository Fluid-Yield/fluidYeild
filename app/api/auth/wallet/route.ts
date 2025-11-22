import { NextRequest, NextResponse } from "next/server";
import { verifyMessage } from "viem";
import { ANON_USER_COOKIE, SIGN_IN_MESSAGE } from "@/lib/constants";
import { ensureUser, linkWalletToUser } from "@/db/user";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const address = body?.address as string | undefined;
  const signature = body?.signature as `0x${string}` | undefined;

  if (!address || !signature) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const ok = await verifyMessage({
    address: address as `0x${string}`,
    message: SIGN_IN_MESSAGE,
    signature,
  });

  if (!ok) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const cookie = req.cookies.get(ANON_USER_COOKIE);

  if (!cookie) {
    return NextResponse.json({ error: "Missing user cookie" }, { status: 400 });
  }

  const userId = cookie.value;

  await ensureUser(userId);
  await linkWalletToUser(userId, address);

  return NextResponse.json({ ok: true });
}
