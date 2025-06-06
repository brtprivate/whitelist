import { createThirdwebClient, defineChain } from "thirdweb";
import { createWallet } from "thirdweb/wallets";

// Create the ThirdWeb client
export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "your-client-id",
});

// Define BSC chain
export const bscChain = defineChain({
  id: 56,
  name: "BNB Smart Chain",
  nativeCurrency: {
    name: "BNB",
    symbol: "BNB",
    decimals: 18,
  },
  rpc: "https://bsc-dataseed1.binance.org/",
  blockExplorers: [
    {
      name: "BscScan",
      url: "https://bscscan.com",
    },
  ],
});

// Create wallet configurations with Trust Wallet prioritized
export const wallets = [
  createWallet("com.trustwallet.app"), // Trust Wallet
  createWallet("io.metamask"), // MetaMask
  createWallet("com.coinbase.wallet"), // Coinbase Wallet
  createWallet("walletConnect"), // WalletConnect
];

// Utility functions
export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
