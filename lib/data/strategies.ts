export interface Strategy {
  slug: string;
  title: string;
  type: string;
  creator: string;
  description: string;
  summary: string;
  performance: string;
  risk: string;
  steps: string[];
  href: string;
}

export const STRATEGIES: Strategy[] = [
  {
    slug: "vault-drip",
    title: "Vault Drip",
    type: "Yield Aggregator",
    creator: "seraph.eth",
    description:
      "Automatically allocates yield from multiple stablecoin vaults into the most profitable pools, compounding returns while minimizing manual adjustments.",
    summary:
      "Vault Drip automatically allocates yield from multiple stablecoin vaults into the most profitable pools, compounding returns while minimizing manual adjustments. It continuously evaluates risk and adjusts exposure to maintain the selected profile.",
    performance: "+9.8%",
    risk: "Medium",
    steps: ["Lend on Compound", "Borrow on Aave", "Supply on Aave"],
    href: "/dashboard/strategies/vault-drip",
  },
  {
    slug: "crosschain-vault",
    title: "CrossChain Vault",
    type: "Multi-Protocol",
    creator: "jermiah",
    description:
      "Diversifies assets across Ethereum, Arbitrum, and Polygon yield vaults.",
    summary:
      "CrossChain Vault allocates capital across major L2 ecosystems, automatically rebalancing into the highest performing vaults and hedging exposure when volatility spikes.",
    performance: "+10.22%",
    risk: "Low",
    steps: [
      "Deposit stablecoin on Ethereum",
      "Bridge to Arbitrum",
      "Allocate to Polygon vault",
    ],
    href: "/dashboard/strategies/crosschain-vault",
  },
  {
    slug: "ethgrow",
    title: "EthGrow",
    type: "Staking",
    creator: "jermiah",
    description: "Stakes ETH and compounds rewards daily for long-term gains.",
    summary:
      "EthGrow compounds validator rewards while dynamically allocating a portion of yield into liquid staking derivatives to maintain liquidity and reduce slashing risk.",
    performance: "+6.41%",
    risk: "Medium",
    steps: [
      "Delegate to validator set",
      "Stake into LSD pools",
      "Auto-compound rewards",
    ],
    href: "/dashboard/strategies/ethgrow",
  },
  {
    slug: "stableflow",
    title: "StableFlow",
    type: "Trading",
    creator: "dl_flash",
    description:
      "Moves stablecoins between lending pools to earn the best rates.",
    summary:
      "StableFlow sweeps through top lending markets each epoch, withdrawing and redeploying capital to whichever pool is offering the highest stablecoin APYs after fees and gas.",
    performance: "+7.84%",
    risk: "Low",
    steps: [
      "Scan lending rates",
      "Withdraw underperforming deposits",
      "Redistribute into higher APY pools",
    ],
    href: "/dashboard/strategies/stableflow",
  },
  {
    slug: "lendloop",
    title: "LendLoop",
    type: "Lending",
    creator: "mario_dev",
    description:
      "Lends on Aave, borrows stablecoins, and re-lends to maximize APY.",
    summary:
      "LendLoop provides levered stablecoin exposure by recursively looping borrow-and-supply actions while maintaining healthy collateral ratios with automated monitoring.",
    performance: "+11.67%",
    risk: "Medium",
    steps: [
      "Supply stablecoin collateral",
      "Borrow matching amount",
      "Re-deposit and monitor health factor",
    ],
    href: "/dashboard/strategies/lendloop",
  },
  {
    slug: "rapidswap",
    title: "RapidSwap",
    type: "Yield",
    creator: "Ethan",
    description:
      "Automatically swaps tokens on multiple DEXs to profit from small price gaps.",
    summary:
      "RapidSwap batches arbitrage opportunities across decentralized exchanges, automatically routing order flow to capitalize on minor price discrepancies with minimal slippage.",
    performance: "+15.12%",
    risk: "High",
    steps: [
      "Monitor DEX price feeds",
      "Execute arbitrage route",
      "Auto-compound profits",
    ],
    href: "/dashboard/strategies/rapidswap",
  },
];

export const getStrategyBySlug = (slug: string) =>
  STRATEGIES.find((strategy) => strategy.slug === slug);
