'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sanitizeDrugSearchInput } from '@/lib/validators';
import { SEARCH_DEBOUNCE_MS } from '@/lib/constants';

interface DrugSearchInputProps {
  onSearch: (term: string) => void;
  onClear: () => void;
  isLoading?: boolean;
  initialValue?: string;
}

export function DrugSearchInput({ onSearch, onClear, isLoading, initialValue = '' }: DrugSearchInputProps) {
  const [value, setValue] = useState(initialValue);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const sanitized = sanitizeDrugSearchInput(e.target.value);
      setValue(sanitized);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (sanitized.length >= 3) {
        debounceRef.current = setTimeout(() => {
          onSearch(sanitized);
        }, SEARCH_DEBOUNCE_MS);
      } else if (sanitized.length === 0) {
        onClear();
      }
    },
    [onSearch, onClear]
  );

  const handleClear = useCallback(() => {
    setValue('');
    onClear();
    inputRef.current?.focus();
  }, [onClear]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
        <Search size={20} aria-hidden="true" />
      </div>
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={false}
        aria-autocomplete="list"
        aria-label="Search for a drug name"
        placeholder="Enter drug name (e.g., rituximab)"
        value={value}
        onChange={handleChange}
        className={cn(
          'w-full rounded-2xl border border-gray-200 bg-white',
          'pl-12 pr-12 py-4 text-lg',
          'placeholder:text-gray-400 text-gray-900',
          'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20',
          'transition-all'
        )}
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full"
          aria-label="Clear search"
        >
          <X size={18} />
        </button>
      )}
      {isLoading && (
        <div className="absolute right-12 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
        </div>
      )}
    </div>
  );
}
