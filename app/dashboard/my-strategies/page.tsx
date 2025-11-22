import { cookies } from "next/headers";

import { ANON_USER_COOKIE } from "@/lib/constants";
import {
  getUserStrategiesByUserId,
  toStrategyCardProps,
} from "@/lib/strategies-service";
import { MyStrategiesClient } from "@/components/dashboard/MyStrategiesClient";

export default async function MyStrategiesPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(ANON_USER_COOKIE)?.value ?? null;

  const { created, joined } = await getUserStrategiesByUserId(userId);

  const createdCards = await Promise.all(created.map(toStrategyCardProps));
  const joinedCards = await Promise.all(joined.map(toStrategyCardProps));

  return <MyStrategiesClient created={createdCards} joined={joinedCards} />;
}
