'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import compatibilityData from '@/data/compatibility-pairs.json';
import { COMPAT_SEARCH_DEBOUNCE_MS, SEARCH_MIN_CHARS } from '@/lib/compatibility-constants';
import type { CompatibilityDrug } from '@/types/compatibility.types';

const drugs = compatibilityData.drugs as CompatibilityDrug[];

export function useCompatibilitySearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<CompatibilityDrug[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const performSearch = useCallback((term: string) => {
    const lower = term.toLowerCase();
    const matches = drugs.filter((drug) => {
      if (drug.name.toLowerCase().startsWith(lower)) return true;
      if (drug.genericName.toLowerCase().startsWith(lower)) return true;
      if (drug.aliases.some((alias) => alias.toLowerCase().startsWith(lower))) return true;
      if (drug.name.toLowerCase().includes(lower)) return true;
      if (drug.genericName.toLowerCase().includes(lower)) return true;
      return false;
    });
    setSuggestions(matches);
  }, []);

  const handleSearchChange = useCallback((rawValue: string) => {
    const sanitized = rawValue.replace(/[<>{}[\]\\]/g, '').trim().slice(0, 100);
    setSearchTerm(sanitized);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (sanitized.length >= SEARCH_MIN_CHARS) {
      debounceRef.current = setTimeout(() => { performSearch(sanitized); }, COMPAT_SEARCH_DEBOUNCE_MS);
    } else {
      setSuggestions([]);
    }
  }, [performSearch]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSuggestions([]);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  useEffect(() => { return () => { if (debounceRef.current) clearTimeout(debounceRef.current); }; }, []);

  return { searchTerm, setSearchTerm: handleSearchChange, suggestions, clearSearch };
}
