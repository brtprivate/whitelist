'use client';

import { useEffect, useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import toast from 'react-hot-toast';
import {
  WHITELIST_CONTRACT_ADDRESS,
  EPOUND_WHITELIST_CONTRACT_ADDRESS,
  WHITELIST_ABI,
  EPOUND_WHITELIST_ABI,
  USDT_ABI,
  EPOUND_ABI,
  SUPPORTED_CURRENCIES,
  CurrencyType
} from '@/lib/contracts';
import CurrencySelector from './CurrencySelector';

export default function SimpleSteps() {
  const { address, isConnected } = useAccount();
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>('USDT');

  // Get current currency config
  const currentCurrency = SUPPORTED_CURRENCIES[selectedCurrency];
  const currentTokenAddress = currentCurrency.address as `0x${string}`;
  const currentTokenABI = selectedCurrency === 'USDT' ? USDT_ABI : EPOUND_ABI;

  // Get whitelist contract config based on currency
  const currentWhitelistAddress = selectedCurrency === 'USDT'
    ? WHITELIST_CONTRACT_ADDRESS
    : EPOUND_WHITELIST_CONTRACT_ADDRESS;
  const currentWhitelistABI = selectedCurrency === 'USDT'
    ? WHITELIST_ABI
    : EPOUND_WHITELIST_ABI;

  // Check if user is whitelisted (using current currency's whitelist contract)
  const { data: isWhitelisted, refetch: refetchWhitelistStatus } = useReadContract({
    address: currentWhitelistAddress,
    abi: currentWhitelistABI,
    functionName: 'checkIfRegistered',
    args: address ? [address] : undefined,
  });

  // Check token allowance for selected currency
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: currentTokenAddress,
    abi: currentTokenABI,
    functionName: 'allowance',
    args: address ? [address, currentWhitelistAddress] : undefined,
  });

  // Whitelist transaction
  const {
    writeContract: writeWhitelist,
    data: whitelistHash,
    isPending: whitelistPending
  } = useWriteContract();

  const { isLoading: whitelistConfirming, isSuccess: whitelistSuccess } = useWaitForTransactionReceipt({
    hash: whitelistHash,
  });

  // USDT approval transaction
  const {
    writeContract: writeApproval,
    data: approvalHash,
    isPending: approvalPending
  } = useWriteContract();

  const { isLoading: approvalConfirming, isSuccess: approvalSuccess } = useWaitForTransactionReceipt({
    hash: approvalHash,
  });

  const handleWhitelist = async () => {
    if (!address) return;

    toast.loading('Adding to whitelist...', { id: 'whitelist' });

    try {
      writeWhitelist({
        address: currentWhitelistAddress,
        abi: currentWhitelistABI,
        functionName: 'whitlistAddress',
        args: [address],
      });
    } catch {
      toast.error('Failed to submit whitelist transaction', { id: 'whitelist' });
    }
  };

  const handleApproval = async () => {
    if (!address) return;

    toast.loading(`Approving ${selectedCurrency === 'USDT' ? 'USDT' : 'ePound'}...`, { id: 'approval' });

    try {
      // Approve max amount
      const maxAmount = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');

      writeApproval({
        address: currentTokenAddress,
        abi: currentTokenABI,
        functionName: 'approve',
        args: [currentWhitelistAddress, maxAmount],
      });
    } catch {
      toast.error('Failed to submit approval transaction', { id: 'approval' });
    }
  };

  // Toast notifications for transaction status
  useEffect(() => {
    if (whitelistSuccess) {
      toast.success('Successfully added to whitelist!', { id: 'whitelist' });
      // Refetch whitelist status after successful transaction
      setTimeout(() => {
        refetchWhitelistStatus();
      }, 2000); // Wait 2 seconds for blockchain to update
    }
  }, [whitelistSuccess, refetchWhitelistStatus]);

  useEffect(() => {
    if (approvalSuccess) {
      toast.success(`${selectedCurrency === 'USDT' ? 'USDT' : 'ePound'} approval successful!`, { id: 'approval' });
      // Refetch allowance after successful approval transaction
      setTimeout(() => {
        refetchAllowance();
      }, 2000); // Wait 2 seconds for blockchain to update
    }
  }, [approvalSuccess, selectedCurrency, refetchAllowance]);

  // Refetch whitelist status and allowance when currency changes
  useEffect(() => {
    if (address) {
      refetchWhitelistStatus();
      refetchAllowance();
    }
  }, [selectedCurrency, address, refetchWhitelistStatus, refetchAllowance]);

  // Determine current step based on status
  const getStep = () => {
    if (!isConnected) return 1;
    if (!selectedCurrency) return 2;
    if (!isWhitelisted) return 3;
    if (!allowance || allowance === 0n) return 4;
    return 5; // All done
  };

  const step = getStep();

  return (
    <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 border border-slate-200">
      {/* Only show progress when wallet is not connected */}
      {!isConnected && (
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-800 mb-3">Get Started</h2>
        </div>
      )}

      {/* Step 1: Connect Wallet - Only show when not connected */}
      {!isConnected && (
        <div className="mb-3 p-3 rounded-lg border border-blue-200 bg-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="font-semibold text-slate-800 text-sm">Connect Wallet</h3>
                <p className="text-slate-600 text-xs">Connect to get started</p>
              </div>
            </div>
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button
                  onClick={openConnectModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                >
                  Connect
                </button>
              )}
            </ConnectButton.Custom>
          </div>
        </div>
      )}

      {/* Currency Selector - Only show when connected */}
      {isConnected && (
        <div className="mb-3">
          <CurrencySelector
            selectedCurrency={selectedCurrency}
            onCurrencyChange={setSelectedCurrency}
            disabled={false}
          />
        </div>
      )}

      {/* Join Whitelist - Only show when connected and currency selected */}
      {isConnected && selectedCurrency && step === 3 && (
        <div className="mb-3 p-3 rounded-lg border border-blue-200 bg-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="font-semibold text-slate-800 text-sm">Join Whitelist</h3>
                <p className="text-slate-600 text-xs">Register your address</p>
              </div>
            </div>
            <button
              onClick={handleWhitelist}
              disabled={whitelistPending || whitelistConfirming}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors disabled:cursor-not-allowed"
            >
              {whitelistPending || whitelistConfirming ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing...</span>
                </div>
              ) : (
                'Join'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Approve Token - Only show when whitelisted */}
      {isConnected && selectedCurrency && step === 4 && (
        <div className="mb-3 p-3 rounded-lg border border-blue-200 bg-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="font-semibold text-slate-800 text-sm">
                  Approve {selectedCurrency === 'USDT' ? 'USDT' : 'ePound'}
                </h3>
                <p className="text-slate-600 text-xs">Allow contract access</p>
              </div>
            </div>
            <button
              onClick={handleApproval}
              disabled={approvalPending || approvalConfirming}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors disabled:cursor-not-allowed"
            >
              {approvalPending || approvalConfirming ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing...</span>
                </div>
              ) : (
                'Approve'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Whitelisted Status Message */}
      {step === 4 && isWhitelisted && (
        <div className="mb-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mr-3">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-emerald-800 text-sm">✅ Whitelisted!</h3>
              <p className="text-emerald-700 text-xs">Ready for {selectedCurrency === 'USDT' ? 'USDT' : 'ePound'} approval</p>
            </div>
          </div>
        </div>
      )}

      {/* Approved Status Message */}
      {step === 5 && allowance && allowance > 0n && (
        <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-blue-800 text-sm">
                ✅ {selectedCurrency === 'USDT' ? 'USDT' : 'ePound'} Approved!
              </h3>
              <p className="text-blue-700 text-xs">Contract access granted</p>
            </div>
          </div>
        </div>
      )}

      {/* Final Success Message */}
      {step === 5 && (
        <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
          <div className="w-10 h-10 mx-auto mb-3 bg-emerald-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-2">🎉 All Complete!</h3>
          <p className="text-slate-600 text-sm">
            Whitelisted and {selectedCurrency === 'USDT' ? 'USDT' : 'ePound'} approved
          </p>
        </div>
      )}


    </div>
  );
}
