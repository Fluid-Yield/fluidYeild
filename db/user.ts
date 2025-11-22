import { eq } from "drizzle-orm";
import { db, users, wallets } from "./client";

export async function ensureUser(userId: string) {
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!existing) {
    await db.insert(users).values({ id: userId });
  }
}

export async function linkWalletToUser(userId: string, address: string) {
  const normalized = address.toLowerCase();

  const [existing] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.address, normalized))
    .limit(1);

  if (!existing) {
    await db.insert(wallets).values({ address: normalized, userId });
  }
}
