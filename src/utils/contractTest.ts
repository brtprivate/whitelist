// Contract testing utilities
import { createPublicClient, http } from 'viem';
import { bsc } from 'viem/chains';
import {
  WHITELIST_CONTRACT_ADDRESS,
  EPOUND_WHITELIST_CONTRACT_ADDRESS,
  USDT_CONTRACT_ADDRESS,
  EPOUND_CONTRACT_ADDRESS,
  WHITELIST_ABI,
  EPOUND_WHITELIST_ABI,
  USDT_ABI,
  EPOUND_ABI
} from '@/lib/contracts';

// Create a public client for BSC
const publicClient = createPublicClient({
  chain: bsc,
  transport: http('https://bsc-dataseed1.binance.org/')
});

// Test functions to verify contract interactions
export const testContractReads = async (userAddress: `0x${string}`) => {
  console.log('Testing contract reads for address:', userAddress);
  
  try {
    // Test USDT contract
    console.log('\n=== USDT Contract Tests ===');
    const usdtName = await publicClient.readContract({
      address: USDT_CONTRACT_ADDRESS as `0x${string}`,
      abi: USDT_ABI,
      functionName: 'name',
    });
    console.log('USDT Name:', usdtName);

    const usdtSymbol = await publicClient.readContract({
      address: USDT_CONTRACT_ADDRESS as `0x${string}`,
      abi: USDT_ABI,
      functionName: 'symbol',
    });
    console.log('USDT Symbol:', usdtSymbol);

    const usdtAllowance = await publicClient.readContract({
      address: USDT_CONTRACT_ADDRESS as `0x${string}`,
      abi: USDT_ABI,
      functionName: 'allowance',
      args: [userAddress, WHITELIST_CONTRACT_ADDRESS as `0x${string}`],
    });
    console.log('USDT Allowance:', usdtAllowance.toString());

    // Test USDT Whitelist contract
    console.log('\n=== USDT Whitelist Contract Tests ===');
    const isUsdtWhitelisted = await publicClient.readContract({
      address: WHITELIST_CONTRACT_ADDRESS as `0x${string}`,
      abi: WHITELIST_ABI,
      functionName: 'checkIfRegistered',
      args: [userAddress],
    });
    console.log('USDT Whitelisted:', isUsdtWhitelisted);

    // Test ePound contract
    console.log('\n=== ePound Contract Tests ===');
    const epoundName = await publicClient.readContract({
      address: EPOUND_CONTRACT_ADDRESS as `0x${string}`,
      abi: EPOUND_ABI,
      functionName: 'name',
    });
    console.log('ePound Name:', epoundName);

    const epoundSymbol = await publicClient.readContract({
      address: EPOUND_CONTRACT_ADDRESS as `0x${string}`,
      abi: EPOUND_ABI,
      functionName: 'symbol',
    });
    console.log('ePound Symbol:', epoundSymbol);

    const epoundAllowance = await publicClient.readContract({
      address: EPOUND_CONTRACT_ADDRESS as `0x${string}`,
      abi: EPOUND_ABI,
      functionName: 'allowance',
      args: [userAddress, EPOUND_WHITELIST_CONTRACT_ADDRESS as `0x${string}`],
    });
    console.log('ePound Allowance:', epoundAllowance.toString());

    // Test ePound Whitelist contract
    console.log('\n=== ePound Whitelist Contract Tests ===');
    const isEpoundWhitelisted = await publicClient.readContract({
      address: EPOUND_WHITELIST_CONTRACT_ADDRESS as `0x${string}`,
      abi: EPOUND_WHITELIST_ABI,
      functionName: 'checkIfRegistered',
      args: [userAddress],
    });
    console.log('ePound Whitelisted:', isEpoundWhitelisted);

    return {
      usdt: {
        name: usdtName,
        symbol: usdtSymbol,
        allowance: usdtAllowance.toString(),
        isWhitelisted: isUsdtWhitelisted
      },
      epound: {
        name: epoundName,
        symbol: epoundSymbol,
        allowance: epoundAllowance.toString(),
        isWhitelisted: isEpoundWhitelisted
      }
    };

  } catch (error) {
    console.error('Contract test error:', error);
    throw error;
  }
};

// Validate contract addresses
export const validateContractAddresses = () => {
  console.log('Contract Addresses:');
  console.log('USDT Token:', USDT_CONTRACT_ADDRESS);
  console.log('USDT Whitelist:', WHITELIST_CONTRACT_ADDRESS);
  console.log('ePound Token:', EPOUND_CONTRACT_ADDRESS);
  console.log('ePound Whitelist:', EPOUND_WHITELIST_CONTRACT_ADDRESS);
  
  // Check if addresses are valid
  const isValidAddress = (addr: string) => /^0x[a-fA-F0-9]{40}$/.test(addr);
  
  return {
    usdtToken: isValidAddress(USDT_CONTRACT_ADDRESS),
    usdtWhitelist: isValidAddress(WHITELIST_CONTRACT_ADDRESS),
    epoundToken: isValidAddress(EPOUND_CONTRACT_ADDRESS),
    epoundWhitelist: isValidAddress(EPOUND_WHITELIST_CONTRACT_ADDRESS)
  };
};
