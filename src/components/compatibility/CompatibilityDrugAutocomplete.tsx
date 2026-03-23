'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCompatibilitySearch } from '@/hooks/useCompatibilitySearch';
import type { CompatibilityDrug } from '@/types/compatibility.types';

interface Props {
  label: string;
  id: string;
  selectedDrug: CompatibilityDrug | null;
  onSelect: (drug: CompatibilityDrug) => void;
  onClear: () => void;
}

export function CompatibilityDrugAutocomplete({ label, id, selectedDrug, onSelect, onClear }: Props) {
  const { searchTerm, setSearchTerm, suggestions, clearSearch } = useCompatibilitySearch();
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const handleSelect = useCallback((drug: CompatibilityDrug) => {
    onSelect(drug);
    clearSearch();
    setIsOpen(false);
    setActiveIndex(-1);
  }, [onSelect, clearSearch]);

  const handleClear = useCallback(() => {
    onClear();
    clearSearch();
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  }, [onClear, clearSearch]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && suggestions[activeIndex]) handleSelect(suggestions[activeIndex]);
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  }, [isOpen, suggestions, activeIndex, handleSelect]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      listRef.current.children[activeIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  if (selectedDrug) {
    return (
      <div className="w-full">
        <label className="mb-1.5 block text-sm font-medium text-[#4E6F4E]">{label}</label>
        <div className="flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl border border-[#8AB78A] bg-[#E9F5E1]">
          <span className="flex-1 text-base font-medium text-[#4E6F4E] truncate">{selectedDrug.name}</span>
          <span className="text-xs text-[#8AB78A] hidden sm:inline truncate max-w-[120px]">{selectedDrug.genericName}</span>
          <button onClick={handleClear} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#8AB78A] hover:text-[#4E6F4E] transition-colors" aria-label={`Remove ${selectedDrug.name}`}>
            <X size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-[#4E6F4E]">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8AB78A] pointer-events-none">
          <Search size={18} aria-hidden="true" />
        </div>
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-expanded={isOpen && suggestions.length > 0}
          aria-autocomplete="list"
          aria-controls={`${id}-listbox`}
          aria-activedescendant={activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined}
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true); setActiveIndex(-1); }}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (suggestions.length > 0) setIsOpen(true); }}
          placeholder="Type drug name..."
          className={cn(
            'w-full min-h-[44px] pl-10 pr-4 py-2.5',
            'rounded-xl border border-[#C1E1B1] text-base bg-white',
            'placeholder:text-[#8AB78A]/60',
            'focus:outline-none focus:ring-2 focus:ring-[#8AB78A] focus:border-[#8AB78A]',
            'transition-colors duration-150'
          )}
        />
      </div>
      {isOpen && suggestions.length > 0 && (
        <ul ref={listRef} id={`${id}-listbox`} role="listbox" aria-label={`${label} suggestions`} className="absolute z-20 mt-1 w-full max-h-60 overflow-auto rounded-xl border border-[#C1E1B1] bg-white shadow-lg">
          {suggestions.map((drug, index) => (
            <li
              key={drug.id}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onClick={() => handleSelect(drug)}
              className={cn(
                'min-h-[44px] px-4 py-3 cursor-pointer flex items-center justify-between gap-2 transition-colors duration-100',
                index === activeIndex ? 'bg-[#E9F5E1] text-[#4E6F4E]' : 'text-gray-800 hover:bg-[#FAFAF5]'
              )}
            >
              <div className="min-w-0">
                <span className="font-medium">{drug.name}</span>
                <span className="text-xs text-[#8AB78A] ml-1.5">{drug.genericName}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
