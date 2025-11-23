"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  flareTestnet,
  flare
} from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Fluid Yield",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [
    flareTestnet,
    flare,
  ],
  ssr: true,
});
