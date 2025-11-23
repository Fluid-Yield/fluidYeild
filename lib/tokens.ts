const SFLR_ADDRESS = "0x4200000000000000000000000000000000000006" as const;
const FXRP_ADDRESS = "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb" as const;
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;
const USDT_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;
const USDT0_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;

export const TOKENS = {
  FLR: {
    symbol: "FLR",
    address: SFLR_ADDRESS,
  },
  SFLR: {
    symbol: "SFLR",
    address: SFLR_ADDRESS,
  },
  FXRP: {
    symbol: "FXRP",
    address: FXRP_ADDRESS,
  },
  USDC: {
    symbol: "USDC",
    address: USDC_ADDRESS,
  },
  USDT: {
    symbol: "USDT",
    address: USDT_ADDRESS,
  },
  USDT0: {
    symbol: "USDT0",
    address: USDT0_ADDRESS,
  },
} as const;

export type TokenKey = keyof typeof TOKENS;
