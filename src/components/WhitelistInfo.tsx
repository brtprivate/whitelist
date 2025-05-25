'use client';

import { useState } from 'react';

export default function WhitelistInfo() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 sm:p-6 mt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">How Whitelist Verification Works</h3>
            <p className="text-slate-600 text-xs sm:text-sm">Learn about our verification process</p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-700 transition-colors"
        >
          <svg 
            className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-blue-200">
          <div className="space-y-4 text-sm sm:text-base text-slate-700">
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">🔍 Real-Time Verification</h4>
              <p className="text-slate-600 text-xs sm:text-sm">
                We check your whitelist status directly from the blockchain using the smart contract's 
                <code className="bg-slate-100 px-1 py-0.5 rounded text-xs mx-1">checkIfRegistered</code> function.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-800 mb-2">🏗️ Smart Contract Integration</h4>
              <div className="text-slate-600 text-xs sm:text-sm space-y-2">
                <p><strong>USDT Whitelist:</strong> <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">0xe2ba9bcac21eb68f86938d166802283ac57c7530</code></p>
                <p><strong>ePound Whitelist:</strong> <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">0x114874b13f6172fcd7b0c3b308c3a006876e8333</code></p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-800 mb-2">⚡ How It Works</h4>
              <ol className="text-slate-600 text-xs sm:text-sm space-y-1 list-decimal list-inside">
                <li>Connect your wallet to BSC network</li>
                <li>Select USDT or ePound currency</li>
                <li>App automatically checks if your address is whitelisted</li>
                <li>If not whitelisted, you can join with one transaction</li>
                <li>Approve token spending for the selected currency</li>
                <li>Status updates automatically after each transaction</li>
              </ol>
            </div>

            <div>
              <h4 className="font-semibold text-slate-800 mb-2">🔄 Auto-Refresh</h4>
              <p className="text-slate-600 text-xs sm:text-sm">
                Your whitelist status is automatically refreshed when you switch currencies or complete transactions. 
                Each currency has its own independent whitelist status.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-semibold text-yellow-800 text-xs sm:text-sm">Important Note</p>
                  <p className="text-yellow-700 text-xs sm:text-sm mt-1">
                    Each currency (USDT/ePound) has separate whitelist contracts. Being whitelisted for one doesn't automatically whitelist you for the other.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
