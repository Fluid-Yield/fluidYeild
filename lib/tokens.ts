export const TOKENS = {
  WBNB: {
    symbol: "WBNB",
    address: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd" as const,
  },
  USDT: {
    symbol: "USDT",
    address: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd" as const,
  },
  BUSD: {
    symbol: "BUSD",
    address: "0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee" as const,
  },
} as const;

export const VTOKENS = {
  vUSDT: {
    symbol: "vUSDT",
    address: "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A" as const,
  },
  vBNB: {
    symbol: "vBNB",
    address: "0x2E7222e51c0f6e98610A1543Aa3836E092CDe62c" as const,
  },
  vBUSD: {
    symbol: "vBUSD",
    address: "0x08e0A5575De71037aE36AbfAfb516595fE68e5e4" as const,
  },
} as const;

export type TokenKey = keyof typeof TOKENS;
export type VTokenKey = keyof typeof VTOKENS;
