'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  useActiveAccount,
  ConnectButton,
  useSendTransaction
} from 'thirdweb/react';
import { getContract, prepareContractCall, readContract } from 'thirdweb';
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
import { client, bscChain, wallets } from '@/lib/thirdweb';
import CurrencySelector from './CurrencySelector';

export default function SimpleSteps() {
  const activeAccount = useActiveAccount();
  const address = activeAccount?.address;
  const isConnected = !!activeAccount;

  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType | null>(null);
  const [isWhitelisted, setIsWhitelisted] = useState<boolean>(false);
  const [allowance, setAllowance] = useState<bigint>(0n);
  const [isLoading, setIsLoading] = useState(false);

  // Type assertion for ThirdWeb's isConnected and selectedCurrency
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

  // Get contracts for current currency
  const whitelistContract = selectedCurrency ? getContract({
    client,
    chain: bscChain,
    address: currentWhitelistAddress,
    abi: currentWhitelistABI,
  }) : null;

  const tokenContract = selectedCurrency ? getContract({
    client,
    chain: bscChain,
    address: currentTokenAddress!,
    abi: currentTokenABI,
  }) : null;

  // Transaction hook
  const { mutate: sendTransaction, isPending: transactionPending } = useSendTransaction();

  // Function to check whitelist status
  const checkWhitelistStatus = useCallback(async () => {
    if (!whitelistContract || !address) {
      setIsWhitelisted(false);
      return;
    }

    try {
      const result = await readContract({
        contract: whitelistContract,
        method: 'checkIfRegistered',
        params: [address],
      });
      setIsWhitelisted(Boolean(result));
    } catch (error) {
      console.error('Error checking whitelist status:', error);
      setIsWhitelisted(false);
    }
  }, [whitelistContract, address]);

  // Function to check token allowance
  const checkAllowance = useCallback(async () => {
    if (!tokenContract || !address || !currentWhitelistAddress) {
      setAllowance(0n);
      return;
    }

    try {
      const result = await readContract({
        contract: tokenContract,
        method: 'allowance',
        params: [address, currentWhitelistAddress],
      });
      setAllowance(BigInt(result?.toString() || '0'));
    } catch (error) {
      console.error('Error checking allowance:', error);
      setAllowance(0n);
    }
  }, [tokenContract, address, currentWhitelistAddress]);

  // Check status when currency or address changes
  useEffect(() => {
    if (address && selectedCurrency) {
      checkWhitelistStatus();
      checkAllowance();
    }
  }, [address, selectedCurrency, checkWhitelistStatus, checkAllowance]);

  const handleWhitelist = async () => {
    if (!address || !selectedCurrency || !whitelistContract || !tokenContract) {
      toast.error('Please connect wallet and select currency', { id: 'whitelist' });
      return;
    }

    setIsLoading(true);
    toast.loading('Processing whitelist...', { id: 'whitelist' });

    try {
      // Check if approval is needed first
      const needsApproval = allowance === 0n;

      if (needsApproval) {
        // First approve the tokens
        const maxAmount = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');

        const approvalTransaction = prepareContractCall({
          contract: tokenContract,
          method: 'approve',
          params: [currentWhitelistAddress, maxAmount],
        });

        // Send approval transaction and wait for user confirmation
        sendTransaction(approvalTransaction as any, {
          onSuccess: () => {
            toast.success(`${selectedCurrency === 'USDT' ? 'USDT' : 'ePound'} approved!`, { id: 'whitelist' });
            // Wait a moment then proceed with whitelist
            setTimeout(() => {
              proceedWithWhitelist();
            }, 2000);
          },
          onError: (error) => {
            console.error('Approval error:', error);
            toast.error('Approval failed. Please try again.', { id: 'whitelist' });
            setIsLoading(false);
          }
        });
      } else {
        // If already approved, proceed directly with whitelist
        proceedWithWhitelist();
      }

    } catch (error) {
      console.error('Transaction error:', error);
      toast.error('Transaction failed. Please try again.', { id: 'whitelist' });
      setIsLoading(false);
    }
  };

  const proceedWithWhitelist = () => {
    if (!whitelistContract || !address) return;

    toast.loading('Adding to whitelist...', { id: 'whitelist' });

    const whitelistTransaction = prepareContractCall({
      contract: whitelistContract,
      method: 'whitlistAddress',
      params: [address],
    });

    sendTransaction(whitelistTransaction as any, {
      onSuccess: () => {
        toast.success('Successfully added to whitelist!', { id: 'whitelist' });
        // Wait and refresh status
        setTimeout(() => {
          checkWhitelistStatus();
          setIsLoading(false);
        }, 3000);
      },
      onError: (error) => {
        console.error('Whitelist error:', error);
        toast.error('Whitelist failed. Please try again.', { id: 'whitelist' });
        setIsLoading(false);
      }
    });
  };

  // Determine current step based on status (currency first, then wallet, then whitelist)
  const getStep = useCallback(() => {
    if (!hasCurrency) return 1; // Currency selection first
    if (!connected) return 2; // Wallet connection second
    if (!Boolean(isWhitelisted)) return 3; // Combined approval + whitelist step
    return 4; // All done
  }, [hasCurrency, connected, isWhitelisted]);

  const step = getStep();

  // Memoized currency selector to avoid TypeScript issues
  const currencySelector = useMemo(() => {
    return (
      <div className="mb-6">
        <CurrencySelector
          selectedCurrency={selectedCurrency}
          onCurrencyChange={setSelectedCurrency}
          disabled={false}
        />
      </div>
    );
  }, [selectedCurrency, setSelectedCurrency]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-slate-100">
      {/* Progress Bar */}
      {hasCurrency && (
        <div className="mb-6 px-1">
          <div className="w-full bg-slate-100 rounded-full h-3 shadow-inner border border-slate-200 relative overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-in-out shadow-sm ${
                (isLoading || transactionPending)
                  ? 'bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 animate-pulse'
                  : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500'
              }`}
              style={{
                width: `${Math.min(((step - 1) / 2) * 100, 100)}%`,
                minWidth: step > 1 ? '8px' : '0px'
              }}
            ></div>
            {/* Loading animation overlay */}
            {(isLoading || transactionPending) && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            )}
          </div>
          {/* Loading text indicator */}
          {(isLoading || transactionPending) && (
            <div className="flex items-center justify-center mt-2">
              <div className="flex items-center text-sm text-slate-600">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="font-medium">
                  {isLoading && 'Processing transaction...'}
                  {transactionPending && 'Confirming transaction...'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Only show get started when currency is not selected */}
      {!hasCurrency && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-800 mb-2">Get Started</h2>
          <p className="text-slate-600 text-sm">Select your preferred currency to begin the whitelist process</p>
        </div>
      )}

      {/* Step 1: Currency Selector - Always show first */}
      {currencySelector}

      {/* Step 2: Connect Wallet - Only show when currency selected but not connected */}
      {hasCurrency && !connected && (
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
                <p className="text-slate-600 text-sm">Connect to continue with {selectedCurrency === 'USDT' ? 'USDT' : 'ePound'}</p>
              </div>
            </div>
            <ConnectButton
              client={client}
              wallets={wallets}
              chain={bscChain}
              connectButton={{
                label: "Connect",
                className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
              }}
            />
          </div>
        </div>
      )}

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

      {/* Join Whitelist - Only show when connected and currency selected but not whitelisted */}
      {connected && hasCurrency && step === 3 ? (
        <div className="mb-5 p-5 rounded-2xl border-2 border-blue-200 bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-5">
                <h3 className="font-bold text-blue-800 text-lg">🎯  Whitelist</h3>
                <p className="text-blue-600 text-sm mt-1">Approve tokens and register your address</p>
                <div className="flex items-center mt-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                  <span className="text-xs text-blue-500 font-medium">Final Step</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleWhitelist}
              disabled={isLoading || transactionPending}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {isLoading || transactionPending ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing...</span>
                </div>
              ) : (
                'Whitelist'
              )}
            </button>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
