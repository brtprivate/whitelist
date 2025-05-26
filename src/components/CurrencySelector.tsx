'use client';

import { SUPPORTED_CURRENCIES, CurrencyType } from '@/lib/contracts';

interface CurrencySelectorProps {
  selectedCurrency: CurrencyType | null;
  onCurrencyChange: (currency: CurrencyType) => void;
  disabled?: boolean;
}

export default function CurrencySelector({
  selectedCurrency,
  onCurrencyChange,
  disabled = false
}: CurrencySelectorProps) {
  return (
    <div className="p-5 rounded-2xl border-2 bg-white border-slate-100 shadow-lg">
      <div className="flex items-center mb-5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-600 text-white shadow-sm">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-4">
          <h3 className="font-bold text-slate-800 text-base">Select Currency</h3>
          <p className="text-slate-600 text-sm">Choose your preferred token</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {Object.entries(SUPPORTED_CURRENCIES).map(([key, currency]) => (
          <button
            key={key}
            onClick={() => onCurrencyChange(key as CurrencyType)}
            disabled={disabled}
            className={`p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
              selectedCurrency === key
                ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-200 shadow-lg shadow-indigo-100'
                : 'bg-slate-50 border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 hover:shadow-md'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center justify-center mb-3">
              <img
                src={currency.icon}
                alt={`${currency.symbol} logo`}
                className="w-8 h-8"
              />
            </div>
            <div className="text-center">
              <h4 className="font-bold text-slate-800 text-sm">{currency.symbol}</h4>
              <p className="text-slate-600 text-xs mt-1">{currency.name}</p>
            </div>
            {selectedCurrency === key && (
              <div className="mt-2 flex justify-center">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
