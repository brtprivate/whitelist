export interface WhitelistStatus {
  isRegistered: boolean;
  totalRegistered: number;
  registeredUsers: string[];
  userBalance: string;
  userAllowance: string;
}

export interface USDTInfo {
  balance: string;
  allowance: string;
  symbol: string;
  decimals: number;
  name: string;
}

export interface TransactionStatus {
  hash?: string;
  status: 'idle' | 'pending' | 'success' | 'error';
  error?: string;
}

export interface ContractInteraction {
  loading: boolean;
  error: string | null;
  success: boolean;
}
