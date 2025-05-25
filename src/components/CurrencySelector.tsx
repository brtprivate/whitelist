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
    <div className="mb-4 p-3 sm:p-4 rounded-xl border bg-white border-slate-200 shadow-sm">
      <div className="flex items-center mb-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center bg-purple-600 text-white shadow-md">
          <span className="text-sm sm:text-base">💰</span>
        </div>
        <div className="ml-3">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base">Select Currency</h3>
          <p className="text-slate-600 text-xs hidden sm:block">Choose your preferred currency</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {Object.entries(SUPPORTED_CURRENCIES).map(([key, currency]) => (
          <button
            key={key}
            onClick={() => onCurrencyChange(key as CurrencyType)}
            disabled={disabled}
            className={`p-2 sm:p-3 rounded-lg border transition-all duration-200 ${
              selectedCurrency === key
                ? 'bg-blue-50 border-blue-200 shadow-md'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center justify-center mb-1 sm:mb-2">
              <span className="text-lg sm:text-xl">{currency.icon}</span>
            </div>
            <div className="text-center">
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm">{currency.symbol}</h4>
              <p className="text-slate-600 text-xs hidden sm:block">{currency.name}</p>
            </div>
            {selectedCurrency === key && (
              <div className="mt-1 flex justify-center">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
