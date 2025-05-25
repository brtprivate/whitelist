'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useWhitelistContract } from '@/hooks/useContract';
import { formatAddress } from '@/lib/web3';

export default function WhitelistManager() {
  const { isConnected } = useAccount();
  const { whitelistStatus, addToWhitelist, loading, error, success, transactionHash } = useWhitelistContract();
  const [newAddress, setNewAddress] = useState('');

  const handleAddToWhitelist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.trim()) return;

    await addToWhitelist(newAddress.trim());
    if (success) {
      setNewAddress('');
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Whitelist Management</h2>
        <p className="text-gray-600">Please connect your wallet to manage the whitelist.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Whitelist Management</h2>

      {/* Current Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Current Status</h3>
        {whitelistStatus ? (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Your Status:</span>
              <span className={`font-semibold ${whitelistStatus.isRegistered ? 'text-green-600' : 'text-red-600'}`}>
                {whitelistStatus.isRegistered ? 'Whitelisted' : 'Not Whitelisted'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Registered:</span>
              <span className="font-semibold text-blue-600">{whitelistStatus.totalRegistered}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Your Balance:</span>
              <span className="font-semibold text-purple-600">{whitelistStatus.userBalance} USDT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Your Allowance:</span>
              <span className="font-semibold text-orange-600">{whitelistStatus.userAllowance} USDT</span>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Loading status...</p>
        )}
      </div>

      {/* Add to Whitelist Form */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Add Address to Whitelist</h3>
        <form onSubmit={handleAddToWhitelist} className="space-y-4">
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Wallet Address
            </label>
            <input
              type="text"
              id="address"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="0x..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !newAddress.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            {loading ? 'Adding to Whitelist...' : 'Add to Whitelist'}
          </button>
        </form>
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

      {/* Registered Users List */}
      {whitelistStatus && whitelistStatus.registeredUsers.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Registered Users</h3>
          <div className="max-h-60 overflow-y-auto">
            <div className="space-y-2">
              {whitelistStatus.registeredUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-mono text-sm">{formatAddress(user)}</span>
                  <span className="text-xs text-gray-500">#{index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
