import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import {
  WHITELIST_CONTRACT_ADDRESS,
  USDT_CONTRACT_ADDRESS,
  WHITELIST_ABI,
  USDT_ABI
} from '@/lib/contracts';
import { WhitelistStatus, USDTInfo } from '@/types/contracts';
import { formatTokenAmount, parseTokenAmount } from '@/lib/web3';

export const useWhitelistContract = () => {
  const { address } = useAccount();
  const [whitelistStatus, setWhitelistStatus] = useState<WhitelistStatus | null>(null);
  const [loading, setLoading] = useState(false);

  // Read contract functions
  const { data: isRegistered } = useReadContract({
    address: WHITELIST_CONTRACT_ADDRESS,
    abi: WHITELIST_ABI,
    functionName: 'checkIfRegistered',
    args: address ? [address] : undefined,
  });

  const { data: totalRegistered } = useReadContract({
    address: WHITELIST_CONTRACT_ADDRESS,
    abi: WHITELIST_ABI,
    functionName: 'totalRegistered',
  });

  const { data: registeredUsers } = useReadContract({
    address: WHITELIST_CONTRACT_ADDRESS,
    abi: WHITELIST_ABI,
    functionName: 'getAllRegistered',
  });

  const { data: userBalance } = useReadContract({
    address: WHITELIST_CONTRACT_ADDRESS,
    abi: WHITELIST_ABI,
    functionName: 'checkbalance',
    args: address ? [address] : undefined,
  });

  const { data: userAllowance } = useReadContract({
    address: WHITELIST_CONTRACT_ADDRESS,
    abi: WHITELIST_ABI,
    functionName: 'checkAllowance',
    args: address ? [address] : undefined,
  });

  // Write contract function
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (address && isRegistered !== undefined && totalRegistered !== undefined) {
      setWhitelistStatus({
        isRegistered: Boolean(isRegistered),
        totalRegistered: Number(totalRegistered),
        registeredUsers: (registeredUsers as string[]) || [],
        userBalance: userBalance ? formatTokenAmount(userBalance.toString(), 18) : '0',
        userAllowance: userAllowance ? formatTokenAmount(userAllowance.toString(), 18) : '0',
      });
    }
  }, [address, isRegistered, totalRegistered, registeredUsers, userBalance, userAllowance]);

  const addToWhitelist = async (userAddress: string) => {
    if (!userAddress) return;

    try {
      setLoading(true);
      writeContract({
        address: WHITELIST_CONTRACT_ADDRESS,
        abi: WHITELIST_ABI,
        functionName: 'whitlistAddress',
        args: [userAddress as `0x${string}`],
      });
    } catch (err) {
      console.error('Error adding to whitelist:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    whitelistStatus,
    addToWhitelist,
    loading: loading || isPending || isConfirming,
    error: error?.message,
    success: isSuccess,
    transactionHash: hash,
  };
};

export const useUSDTContract = () => {
  const { address } = useAccount();
  const [usdtInfo, setUsdtInfo] = useState<USDTInfo | null>(null);
  const [loading, setLoading] = useState(false);

  // Read contract functions
  const { data: balance } = useReadContract({
    address: USDT_CONTRACT_ADDRESS,
    abi: USDT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { data: allowance } = useReadContract({
    address: USDT_CONTRACT_ADDRESS,
    abi: USDT_ABI,
    functionName: 'allowance',
    args: address ? [address, WHITELIST_CONTRACT_ADDRESS] : undefined,
  });

  const { data: symbol } = useReadContract({
    address: USDT_CONTRACT_ADDRESS,
    abi: USDT_ABI,
    functionName: 'symbol',
  });

  const { data: decimals } = useReadContract({
    address: USDT_CONTRACT_ADDRESS,
    abi: USDT_ABI,
    functionName: 'decimals',
  });

  const { data: name } = useReadContract({
    address: USDT_CONTRACT_ADDRESS,
    abi: USDT_ABI,
    functionName: 'name',
  });

  // Write contract function
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (balance !== undefined && allowance !== undefined && decimals !== undefined) {
      setUsdtInfo({
        balance: formatTokenAmount(balance.toString(), Number(decimals)),
        allowance: formatTokenAmount(allowance.toString(), Number(decimals)),
        symbol: (symbol as string) || 'USDT',
        decimals: Number(decimals),
        name: (name as string) || 'Tether USD',
      });
    }
  }, [balance, allowance, symbol, decimals, name]);

  const approveUSDT = async (amount: string) => {
    if (!amount || !decimals) return;

    try {
      setLoading(true);
      const parsedAmount = parseTokenAmount(amount, Number(decimals));

      writeContract({
        address: USDT_CONTRACT_ADDRESS,
        abi: USDT_ABI,
        functionName: 'approve',
        args: [WHITELIST_CONTRACT_ADDRESS, parsedAmount],
      });
    } catch (err) {
      console.error('Error approving USDT:', err);
    } finally {
      setLoading(false);
    }
  };

  const approveMaxUSDT = async () => {
    try {
      setLoading(true);
      const maxAmount = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');

      writeContract({
        address: USDT_CONTRACT_ADDRESS,
        abi: USDT_ABI,
        functionName: 'approve',
        args: [WHITELIST_CONTRACT_ADDRESS, maxAmount],
      });
    } catch (err) {
      console.error('Error approving max USDT:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    usdtInfo,
    approveUSDT,
    approveMaxUSDT,
    loading: loading || isPending || isConfirming,
    error: error?.message,
    success: isSuccess,
    transactionHash: hash,
  };
};
