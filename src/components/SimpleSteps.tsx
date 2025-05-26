'use client';

import React, { useEffect, useState } from 'react';
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
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType | null>(null);

  // Type assertion for wagmi's isConnected and selectedCurrency
  const connected = Boolean(isConnected);
  const hasCurrency = Boolean(selectedCurrency);





  // Get current currency config - only if currency is selected
  const currentCurrency = selectedCurrency ? SUPPORTED_CURRENCIES[selectedCurrency] : null;
  const currentTokenAddress = currentCurrency?.address as `0x${string}` | undefined;
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
    address: selectedCurrency ? currentWhitelistAddress : undefined,
    abi: selectedCurrency ? currentWhitelistABI : undefined,
    functionName: 'checkIfRegistered',
    args: address && selectedCurrency ? [address] : undefined,
    query: {
      enabled: Boolean(address && selectedCurrency),
    },
  });

  // Check token allowance for selected currency
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: selectedCurrency ? currentTokenAddress : undefined,
    abi: selectedCurrency ? currentTokenABI : undefined,
    functionName: 'allowance',
    args: address && selectedCurrency ? [address, currentWhitelistAddress] : undefined,
    query: {
      enabled: Boolean(address && selectedCurrency && currentTokenAddress && currentWhitelistAddress),
    },
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
    if (!address || !selectedCurrency) {
      toast.error('Please connect wallet and select currency', { id: 'whitelist' });
      return;
    }

    if (!currentWhitelistAddress) {
      toast.error('Whitelist contract address not found', { id: 'whitelist' });
      return;
    }

    console.log('Starting whitelist process:', {
      address,
      selectedCurrency,
      whitelistContract: currentWhitelistAddress,
      isWhitelisted: Boolean(isWhitelisted)
    });

    toast.loading('Adding to whitelist...', { id: 'whitelist' });

    try {
      writeWhitelist({
        address: currentWhitelistAddress,
        abi: currentWhitelistABI,
        functionName: 'whitlistAddress',
        args: [address],
      });
    } catch (error) {
      console.error('Whitelist transaction error:', error);
      toast.error('Failed to submit whitelist transaction', { id: 'whitelist' });
    }
  };

  const handleApproval = async () => {
    if (!address || !selectedCurrency || !currentTokenAddress) {
      toast.error('Please connect wallet and select currency', { id: 'approval' });
      return;
    }

    if (!currentWhitelistAddress) {
      toast.error('Whitelist contract address not found', { id: 'approval' });
      return;
    }

    console.log('Starting approval process:', {
      address,
      selectedCurrency,
      tokenContract: currentTokenAddress,
      whitelistContract: currentWhitelistAddress,
      currentAllowance: allowance?.toString()
    });

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
    } catch (error) {
      console.error('Approval transaction error:', error);
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
      console.log('Refetching status for currency change:', { selectedCurrency, address });
      refetchWhitelistStatus();
      refetchAllowance();
    }
  }, [selectedCurrency, address, refetchWhitelistStatus, refetchAllowance]);

  // Determine current step based on status (approval first, then whitelist)
  const getStep = () => {
    if (!connected) return 1;
    if (!hasCurrency) return 2;
    if (!allowance || (typeof allowance === 'bigint' && allowance === 0n)) return 3; // Approval step first
    if (!Boolean(isWhitelisted)) return 4; // Whitelist step second
    return 5; // All done
  };

  // Debug logging for status changes
  useEffect(() => {
    console.log('Status update:', {
      address,
      selectedCurrency,
      isWhitelisted: Boolean(isWhitelisted),
      allowance: allowance?.toString(),
      step: getStep()
    });
  }, [address, selectedCurrency, isWhitelisted, allowance]);



  const step = getStep();

  // Pre-render components to avoid TypeScript issues
  const currencySelector: React.ReactNode = isConnected ? (
    <div className="mb-6">
      <CurrencySelector
        selectedCurrency={selectedCurrency}
        onCurrencyChange={setSelectedCurrency}
        disabled={false}
      />
    </div>
  ) : null;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-slate-100">
      {/* Progress Bar */}
      {connected && (
        <div className="mb-6 px-1">
          <div className="w-full bg-slate-100 rounded-full h-3 shadow-inner border border-slate-200 relative overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-in-out shadow-sm ${
                (approvalPending || approvalConfirming || whitelistPending || whitelistConfirming)
                  ? 'bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 animate-pulse'
                  : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500'
              }`}
              style={{
                width: `${Math.min(((step - 1) / 3) * 100, 100)}%`,
                minWidth: step > 1 ? '8px' : '0px'
              }}
            ></div>
            {/* Loading animation overlay */}
            {(approvalPending || approvalConfirming || whitelistPending || whitelistConfirming) && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            )}
          </div>
          {/* Loading text indicator */}
          {(approvalPending || approvalConfirming || whitelistPending || whitelistConfirming) && (
            <div className="flex items-center justify-center mt-2">
              <div className="flex items-center text-sm text-slate-600">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="font-medium">
                  {approvalPending && 'Submitting approval...'}
                  {approvalConfirming && 'Confirming approval...'}
                  {whitelistPending && 'Submitting whitelist...'}
                  {whitelistConfirming && 'Confirming whitelist...'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Only show get started when wallet is not connected */}
      {!connected && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-800 mb-2">Get Started</h2>
          <p className="text-slate-600 text-sm">Connect your wallet to begin the whitelist process</p>
        </div>
      )}

      {/* Step 1: Connect Wallet - Only show when not connected */}
      {!connected && (
        <div className="mb-4 p-4 rounded-xl border-2 border-blue-100 bg-blue-50/50 hover:bg-blue-50 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-slate-800 text-base">Connect Wallet</h3>
                <p className="text-slate-600 text-sm">Connect to get started</p>
              </div>
            </div>
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button
                  onClick={openConnectModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                >
                  Connect
                </button>
              )}
            </ConnectButton.Custom>
          </div>
        </div>
      )}

      {/* Currency Selector - Only show when connected */}
      {(currencySelector as any)}



      {/* Whitelist Status Display - Only show when connected and currency selected */}
      {connected && hasCurrency ? (
        <div className="mb-6">
          <div className={`p-5 rounded-2xl border-2 transition-all duration-300 ${
            Boolean(isWhitelisted)
              ? 'bg-emerald-50 border-emerald-200 shadow-lg shadow-emerald-100/50'
              : 'bg-red-50 border-red-200 shadow-lg shadow-red-100/50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  Boolean(isWhitelisted)
                    ? 'bg-emerald-500 shadow-lg shadow-emerald-200'
                    : 'bg-red-500 shadow-lg shadow-red-200'
                }`}>
                  {Boolean(isWhitelisted) ? (
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-5">
                  <h3 className={`text-xl font-bold ${
                    Boolean(isWhitelisted) ? 'text-emerald-800' : 'text-red-800'
                  }`}>
                    {Boolean(isWhitelisted) ? '🎉 You are Whitelisted!' : '❌ Not Whitelisted'}
                  </h3>
                  <p className={`text-sm mt-1 ${
                    Boolean(isWhitelisted) ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {Boolean(isWhitelisted)
                      ? null
                      : `Complete the steps below to access ${selectedCurrency === 'USDT' ? 'USDT' : 'ePound'} features`
                    }
                  </p>
                </div>
              </div>
              {Boolean(isWhitelisted) && (
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-emerald-400 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}

      {/* Approve Token - Only show when connected and currency selected */}
      {connected && hasCurrency && step === 3 ? (
        <div className="mb-5 p-5 rounded-2xl border-2 border-purple-200 bg-purple-50 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-14 h-14 rounded-2xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-200">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-5">
                <h3 className="font-bold text-purple-800 text-lg">
                  💰 Approve {selectedCurrency === 'USDT' ? 'USDT' : 'ePound'}
                </h3>
                <p className="text-purple-600 text-sm mt-1">Allow smart contract access to your tokens</p>
                <div className="flex items-center mt-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                  <span className="text-xs text-purple-500 font-medium">Step 1 of 2</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleApproval}
              disabled={approvalPending || approvalConfirming}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {approvalPending || approvalConfirming ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing...</span>
                </div>
              ) : (
                '✨ Approve'
              )}
            </button>
          </div>
        </div>
      ) : (
        <></>
      )}

      {/* Join Whitelist - Only show when approved */}
      {connected && hasCurrency && step === 4 ? (
        <div className="mb-5 p-5 rounded-2xl border-2 border-blue-200 bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-5">
                <h3 className="font-bold text-blue-800 text-lg">🎯 Join Whitelist</h3>
                <p className="text-blue-600 text-sm mt-1">Register your address for access</p>
                <div className="flex items-center mt-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                  <span className="text-xs text-blue-500 font-medium">Step 2 of 2</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleWhitelist}
              disabled={whitelistPending || whitelistConfirming}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {whitelistPending || whitelistConfirming ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing...</span>
                </div>
              ) : (
                '🚀 Join Now'
              )}
            </button>
          </div>
        </div>
      ) : (
        <></>
      )}

      {/* Approved Status Message */}
      {step === 4 && allowance && typeof allowance === 'bigint' && allowance > 0n && (
        <div className="mb-4 p-4 bg-emerald-50 rounded-xl border-2 border-emerald-200 shadow-sm">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center mr-4 shadow-sm">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-emerald-800 text-base">
                ✅ {selectedCurrency === 'USDT' ? 'USDT' : 'ePound'} Approved!
              </h3>
              <p className="text-emerald-600 text-sm">Ready for whitelist registration</p>
            </div>
          </div>
        </div>
      )}

      {/* Final Success Message */}
      {/* {step === 5 && Boolean(isWhitelisted) && (
        <div className="text-center p-6 bg-emerald-50 rounded-2xl border-2 border-emerald-200 shadow-lg">
          <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-emerald-800 mb-2">🎉 All Complete!</h3>
          <p className="text-emerald-600 text-base mb-3">
            {selectedCurrency === 'USDT' ? 'USDT' : 'ePound'} approved and whitelisted
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-emerald-100 rounded-xl">
            <div className="w-3 h-3 bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
            <span className="text-emerald-700 text-sm font-medium">Ready for transactions</span>
          </div>
        </div>
      )} */}

    </div>
  );
}
