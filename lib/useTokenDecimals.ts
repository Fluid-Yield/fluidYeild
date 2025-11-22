import { useReadContract } from "wagmi";

import { erc20Abi } from "@/lib/erc20-abi";

export function useTokenDecimals(token?: `0x${string}` | string) {
  const { data } = useReadContract({
    abi: erc20Abi,
    address: token as `0x${string}` | undefined,
    functionName: "decimals",
    args: [],
    query: {
      enabled: !!token,
      staleTime: 1000 * 60 * 10,
      gcTime: 1000 * 60 * 10,
    },
  });

  const decimals = typeof data === "number" ? data : 18;

  return { decimals };
}
