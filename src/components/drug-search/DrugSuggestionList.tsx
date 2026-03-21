'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Pill } from 'lucide-react';
import type { RxNormConcept } from '@/types/drug.types';

interface DrugSuggestionListProps {
  suggestions: RxNormConcept[];
  onSelect: (concept: RxNormConcept) => void;
  isVisible: boolean;
}

export function DrugSuggestionList({ suggestions, onSelect, isVisible }: DrugSuggestionListProps) {
  if (!isVisible || suggestions.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.ul
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.15 }}
        role="listbox"
        aria-label="Drug search results"
        className="absolute z-50 w-full mt-2 rounded-2xl border border-gray-100 bg-white shadow-xl overflow-hidden max-h-80 overflow-y-auto"
      >
        {suggestions.map((concept) => (
          <li key={concept.rxcui} role="option" aria-selected={false}>
            <button
              onClick={() => onSelect(concept)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-50 last:border-b-0"
            >
              <Pill size={18} className="text-blue-500 flex-shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <p className="font-medium text-gray-900 truncate">{concept.name}</p>
                <p className="text-xs text-gray-500">
                  RxCUI: {concept.rxcui} &middot; {concept.tty}
                </p>
              </div>
            </button>
          </li>
        ))}
      </motion.ul>
    </AnimatePresence>
  );
}
