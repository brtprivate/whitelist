'use client';

import { useEffect, useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import toast from 'react-hot-toast';
import {
  WHITELIST_CONTRACT_ADDRESS,
  WHITELIST_ABI,
  USDT_ABI,
  EPOUND_ABI,
  SUPPORTED_CURRENCIES,
  CurrencyType
} from '@/lib/contracts';
import CurrencySelector from './CurrencySelector';

export default function SimpleSteps() {
  const { address, isConnected } = useAccount();
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>('USDT');

  // Check if user is whitelisted
  const { data: isWhitelisted } = useReadContract({
    address: WHITELIST_CONTRACT_ADDRESS,
    abi: WHITELIST_ABI,
    functionName: 'checkIfRegistered',
    args: address ? [address] : undefined,
  });

  // Get current currency config
  const currentCurrency = SUPPORTED_CURRENCIES[selectedCurrency];
  const currentTokenAddress = currentCurrency.address as `0x${string}`;
  const currentTokenABI = selectedCurrency === 'USDT' ? USDT_ABI : EPOUND_ABI;

  // Check token allowance for selected currency
  const { data: allowance } = useReadContract({
    address: currentTokenAddress,
    abi: currentTokenABI,
    functionName: 'allowance',
    args: address ? [address, WHITELIST_CONTRACT_ADDRESS] : undefined,
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
        address: WHITELIST_CONTRACT_ADDRESS,
        abi: WHITELIST_ABI,
        functionName: 'whitlistAddress',
        args: [address],
      });
    } catch {
      toast.error('Failed to submit whitelist transaction', { id: 'whitelist' });
    }
  };

  const handleApproval = async () => {
    if (!address) return;

    toast.loading(`Approving ${currentCurrency.symbol}...`, { id: 'approval' });

    try {
      // Approve max amount
      const maxAmount = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');

      writeApproval({
        address: currentTokenAddress,
        abi: currentTokenABI,
        functionName: 'approve',
        args: [WHITELIST_CONTRACT_ADDRESS, maxAmount],
      });
    } catch {
      toast.error('Failed to submit approval transaction', { id: 'approval' });
    }
  };

  // Toast notifications for transaction status
  useEffect(() => {
    if (whitelistSuccess) {
      toast.success('Successfully added to whitelist!', { id: 'whitelist' });
    }
  }, [whitelistSuccess]);

  useEffect(() => {
    if (approvalSuccess) {
      toast.success(`${currentCurrency.symbol} approval successful!`, { id: 'approval' });
    }
  }, [approvalSuccess, currentCurrency.symbol]);

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
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-slate-200">
      {/* Progress Bar */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800">Your Progress</h2>
          <div className="flex items-center space-x-2">
            <span className="text-xs sm:text-sm font-medium text-slate-600">Step {step} of 4</span>
            <div className="w-8 sm:w-12 h-1.5 sm:h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(step / 4) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 ${
                step >= stepNum
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-200 text-slate-500'
              }`}>
                {step > stepNum ? (
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : stepNum}
              </div>
              {stepNum < 4 && (
                <div className={`w-8 sm:w-12 h-0.5 sm:h-1 mx-1 sm:mx-2 rounded-full transition-all duration-300 ${
                  step > stepNum ? 'bg-blue-600' : 'bg-slate-200'
                }`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Connect Wallet */}
      <div className={`mb-4 p-3 sm:p-4 rounded-xl border transition-all duration-300 ${
        step === 1
          ? 'bg-blue-50 border-blue-200 shadow-md'
          : step > 1
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center font-bold text-sm sm:text-base transition-all duration-300 ${
              step > 1
                ? 'bg-emerald-500 text-white shadow-md'
                : step === 1
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-300 text-slate-600'
            }`}>
              {step > 1 ? (
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3 sm:ml-4">
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">Connect Wallet</h3>
              <p className="text-slate-600 text-xs sm:text-sm hidden sm:block">Connect your wallet to BSC network</p>
            </div>
          </div>
          {step === 1 && (
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button
                  onClick={openConnectModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Connect
                </button>
              )}
            </ConnectButton.Custom>
          )}
        </div>
      </div>

      {/* Step 2: Select Currency */}
      {step >= 2 && (
        <CurrencySelector
          selectedCurrency={selectedCurrency}
          onCurrencyChange={setSelectedCurrency}
          disabled={step > 2}
        />
      )}

      {/* Step 3: Join Whitelist */}
      <div className={`mb-4 p-3 sm:p-4 rounded-xl border transition-all duration-300 ${
        step === 3
          ? 'bg-blue-50 border-blue-200 shadow-md'
          : step > 3
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center font-bold text-sm sm:text-base transition-all duration-300 ${
              step > 3
                ? 'bg-emerald-500 text-white shadow-md'
                : step === 3
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-300 text-slate-600'
            }`}>
              {step > 3 ? (
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3 sm:ml-4">
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">Join Whitelist</h3>
              <p className="text-slate-600 text-xs sm:text-sm hidden sm:block">Add your address to the whitelist</p>
            </div>
          </div>
          {step === 3 && (
            <button
              onClick={handleWhitelist}
              disabled={whitelistPending || whitelistConfirming}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
            >
              {whitelistPending || whitelistConfirming ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-1 h-3 w-3 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="hidden sm:inline">Processing...</span>
                  <span className="sm:hidden">...</span>
                </div>
              ) : (
                <>
                  <span className="hidden sm:inline">Join Whitelist</span>
                  <span className="sm:hidden">Join</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Step 4: Approve Token */}
      <div className={`mb-4 p-3 sm:p-4 rounded-xl border transition-all duration-300 ${
        step === 4
          ? 'bg-blue-50 border-blue-200 shadow-md'
          : step > 4
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center font-bold text-sm sm:text-base transition-all duration-300 ${
              step > 4
                ? 'bg-emerald-500 text-white shadow-md'
                : step === 4
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-300 text-slate-600'
            }`}>
              {step > 4 ? (
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v1.9c0 .55.45 1 1 1h.5c.83 0 1.5.67 1.5 1.5v.6c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-.6c0-.83.67-1.5 1.5-1.5H17c.55 0 1-.45 1-1V6a2 2 0 00-2-2H4zm2 5.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm6.5 1.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3 sm:ml-4">
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">Approve {currentCurrency.symbol}</h3>
              <p className="text-slate-600 text-xs sm:text-sm hidden sm:block">Allow contract to use your {currentCurrency.symbol}</p>
            </div>
          </div>
          {step === 4 && (
            <button
              onClick={handleApproval}
              disabled={approvalPending || approvalConfirming}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
            >
              {approvalPending || approvalConfirming ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-1 h-3 w-3 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="hidden sm:inline">Processing...</span>
                  <span className="sm:hidden">...</span>
                </div>
              ) : (
                <>
                  <span className="hidden sm:inline">Approve {currentCurrency.symbol}</span>
                  <span className="sm:hidden">Approve</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Success Message */}
      {step === 5 && (
        <div className="text-center p-4 sm:p-6 bg-emerald-50 rounded-xl border border-emerald-200 shadow-md">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-3">🎉 All Done!</h3>
          <p className="text-slate-600 text-sm sm:text-base mb-4">You&apos;re successfully whitelisted and {currentCurrency.symbol} is approved</p>

          <div className="grid grid-cols-2 gap-2 sm:gap-3 max-w-xs mx-auto">
            <div className="bg-white p-2 sm:p-3 rounded-lg border border-emerald-200">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-500 rounded-lg mx-auto mb-1 sm:mb-2 flex items-center justify-center">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-700">Whitelisted</p>
            </div>
            <div className="bg-white p-2 sm:p-3 rounded-lg border border-emerald-200">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-500 rounded-lg mx-auto mb-1 sm:mb-2 flex items-center justify-center">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-700">{currentCurrency.symbol} Approved</p>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Links */}
      {(whitelistHash || approvalHash) && (
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200">
          <h4 className="font-bold text-slate-800 mb-3 flex items-center text-sm sm:text-base">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline">Transaction History</span>
            <span className="sm:hidden">Transactions</span>
          </h4>
          <div className="space-y-2 sm:space-y-3">
            {whitelistHash && (
              <div className="flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-xs sm:text-sm">
                      <span className="hidden sm:inline">Whitelist Transaction</span>
                      <span className="sm:hidden">Whitelist</span>
                    </p>
                    <p className="text-xs text-slate-500 hidden sm:block">Successfully added to whitelist</p>
                  </div>
                </div>
                <a
                  href={`https://bscscan.com/tx/${whitelistHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center transition-colors"
                >
                  <span className="hidden sm:inline">View on BSCScan</span>
                  <span className="sm:hidden">View</span>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            )}
            {approvalHash && (
              <div className="flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-xs sm:text-sm">
                      <span className="hidden sm:inline">{currentCurrency.symbol} Approval</span>
                      <span className="sm:hidden">{currentCurrency.symbol}</span>
                    </p>
                    <p className="text-xs text-slate-500 hidden sm:block">Successfully approved {currentCurrency.symbol} spending</p>
                  </div>
                </div>
                <a
                  href={`https://bscscan.com/tx/${approvalHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center transition-colors"
                >
                  <span className="hidden sm:inline">View on BSCScan</span>
                  <span className="sm:hidden">View</span>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
