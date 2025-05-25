'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useUSDTContract } from '@/hooks/useContract';
import { formatAddress } from '@/lib/web3';
import { WHITELIST_CONTRACT_ADDRESS } from '@/lib/contracts';

export default function USDTApproval() {
  const { isConnected } = useAccount();
  const { usdtInfo, approveUSDT, approveMaxUSDT, loading, error, success, transactionHash } = useUSDTContract();
  const [approvalAmount, setApprovalAmount] = useState('');

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvalAmount.trim()) return;

    await approveUSDT(approvalAmount.trim());
    if (success) {
      setApprovalAmount('');
    }
  };

  const handleApproveMax = async () => {
    await approveMaxUSDT();
  };

  if (!isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">USDT Approval</h2>
        <p className="text-gray-600">Please connect your wallet to manage USDT approvals.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">USDT Approval</h2>

      {/* USDT Info */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Token Information</h3>
        {usdtInfo ? (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Token:</span>
              <span className="font-semibold text-blue-600">{usdtInfo.name} ({usdtInfo.symbol})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Your Balance:</span>
              <span className="font-semibold text-green-600">{usdtInfo.balance} {usdtInfo.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Current Allowance:</span>
              <span className="font-semibold text-orange-600">{usdtInfo.allowance} {usdtInfo.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Spender Contract:</span>
              <span className="font-mono text-sm text-purple-600">{formatAddress(WHITELIST_CONTRACT_ADDRESS)}</span>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Loading token information...</p>
        )}
      </div>

      {/* Approval Form */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Approve USDT Spending</h3>
        <form onSubmit={handleApprove} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Approval Amount
            </label>
            <input
              type="number"
              id="amount"
              value={approvalAmount}
              onChange={(e) => setApprovalAmount(e.target.value)}
              placeholder="Enter amount to approve"
              step="0.000001"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading || !approvalAmount.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              {loading ? 'Approving...' : 'Approve Amount'}
            </button>

            <button
              type="button"
              onClick={handleApproveMax}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              {loading ? 'Approving...' : 'Approve Max'}
            </button>
          </div>
        </form>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setApprovalAmount('100')}
            disabled={loading}
            className="bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Approve 100 USDT
          </button>
          <button
            onClick={() => setApprovalAmount('1000')}
            disabled={loading}
            className="bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Approve 1,000 USDT
          </button>
          <button
            onClick={() => setApprovalAmount('10000')}
            disabled={loading}
            className="bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Approve 10,000 USDT
          </button>
          <button
            onClick={() => setApprovalAmount('0')}
            disabled={loading}
            className="bg-red-200 hover:bg-red-300 disabled:bg-gray-100 text-red-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Revoke Approval
          </button>
        </div>
      </div>

      {/* Transaction Status */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-semibold">Error:</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {success && transactionHash && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-semibold">Success!</p>
          <p className="text-green-600 text-sm">
            Transaction:
            <a
              href={`https://bscscan.com/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 underline hover:text-green-800"
            >
              {formatAddress(transactionHash)}
            </a>
          </p>
        </div>
      )}

      {/* Information */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-blue-800 font-semibold mb-2">ℹ️ Information</h4>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Approving USDT allows the whitelist contract to spend your tokens</li>
          <li>• You can approve a specific amount or unlimited (max) approval</li>
          <li>• You can revoke approval by setting the amount to 0</li>
          <li>• Always verify the contract address before approving</li>
        </ul>
      </div>
    </div>
  );
}
