'use client';

import { SUPPORTED_CURRENCIES, CurrencyType } from '@/lib/contracts';

interface CurrencySelectorProps {
  selectedCurrency: CurrencyType;
  onCurrencyChange: (currency: CurrencyType) => void;
  disabled?: boolean;
}

export default function CurrencySelector({
  selectedCurrency,
  onCurrencyChange,
  disabled = false
}: CurrencySelectorProps) {
  return (
    <div className="p-3 rounded-lg border bg-white border-slate-200">
      <div className="flex items-center mb-3">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-purple-600 text-white">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="font-semibold text-slate-800 text-sm">Select Currency</h3>
          <p className="text-slate-600 text-xs">Choose your token</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {Object.entries(SUPPORTED_CURRENCIES).map(([key, currency]) => (
          <button
            key={key}
            onClick={() => onCurrencyChange(key as CurrencyType)}
            disabled={disabled}
            className={`p-2 rounded-lg border transition-all duration-200 ${
              selectedCurrency === key
                ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200'
                : 'bg-slate-50 border-slate-200 hover:bg-blue-50 hover:border-blue-200'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center justify-center mb-1">
              <span className="text-base">{currency.icon}</span>
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-slate-800 text-xs">{currency.symbol}</h4>
              <p className="text-slate-600 text-xs">{currency.name}</p>
            </div>
            {selectedCurrency === key && (
              <div className="mt-1 flex justify-center">
                <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
