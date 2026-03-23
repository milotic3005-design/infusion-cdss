'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { DrugSearchInput } from '@/components/drug-search/DrugSearchInput';
import { DrugSuggestionList } from '@/components/drug-search/DrugSuggestionList';
import { DrugSearchCard } from '@/components/drug-search/DrugSearchCard';
import { Button } from '@/components/ui/Button';
import { useDrugSearch } from '@/hooks/useDrugSearch';
import { useDrugProfile } from '@/hooks/useDrugProfile';
import { useSessionStore } from '@/store/session.store';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Syringe, Timer } from 'lucide-react';
import type { RxNormConcept } from '@/types/drug.types';

export default function HomePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const selectedDrug = useSessionStore((s) => s.selectedDrug);
  const reactionProfile = useSessionStore((s) => s.reactionProfile);
  const setDrug = useSessionStore((s) => s.setDrug);
  const setReactionProfile = useSessionStore((s) => s.setReactionProfile);
  const resetSession = useSessionStore((s) => s.resetSession);

  const { data: suggestions = [], isLoading: isSearching } = useDrugSearch(searchTerm);

  const { data: profile, isLoading: isLoadingProfile } = useDrugProfile(
    selectedDrug?.rxcui ?? null,
    selectedDrug?.genericName ?? null
  );

  // Sync profile to store when it arrives
  useEffect(() => {
    if (profile && profile !== reactionProfile) {
      setReactionProfile(profile);
    }
  }, [profile, reactionProfile, setReactionProfile]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setShowSuggestions(true);
  }, []);

  const handleClear = useCallback(() => {
    setSearchTerm('');
    setShowSuggestions(false);
    resetSession();
  }, [resetSession]);

  const handleSelect = useCallback(
    (concept: RxNormConcept) => {
      setShowSuggestions(false);
      setSearchTerm('');

      // Extract generic name: for IN type it's the full name,
      // for SBD/SCD parse out the drug name (e.g., "10 ML rituximab 10 MG/ML..." → "rituximab")
      let genericName = concept.name;
      if (concept.tty !== 'IN') {
        const match = concept.name.match(/\d+\s+ML\s+(\S+)/i)
          || concept.name.match(/(\S+)\s+\d+\s+MG/i);
        if (match) {
          genericName = match[1];
        } else {
          // Fallback: find the first word that's not a number or unit
          const words = concept.name.split(' ');
          genericName = words.find(w => /^[a-zA-Z]{3,}/.test(w) && !['MG', 'ML', 'MG/ML'].includes(w.toUpperCase())) || words[0];
        }
      }

      setDrug({
        rxcui: concept.rxcui,
        genericName: genericName.toLowerCase(),
        brandNames: [],
        drugClasses: [],
        interactions: [],
        route: 'intravenous',
        dosageForm: '',
      });
    },
    [setDrug]
  );

  const handleProceed = () => {
    router.push('/assess');
  };

  return (
    <div className="flex flex-col items-center pt-8 md:pt-16">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-3">
          <ShieldCheck size={28} className="text-[#4E6F4E]" />
          <h1 className="text-2xl md:text-3xl font-bold text-[#4E6F4E]">
            Infusion Reaction Decision Support
          </h1>
        </div>
        <p className="text-[#5A7A5A] text-sm max-w-md">
          NCI CTCAE v6.0 grading with real-time clinical decision support
        </p>
      </div>

      {/* Search Panel */}
      <GlassPanel className="w-full max-w-2xl p-6 md:p-8" intensity="medium">
        {!selectedDrug && (
          <div className="relative">
            <DrugSearchInput
              onSearch={handleSearch}
              onClear={handleClear}
              isLoading={isSearching}
            />
            <DrugSuggestionList
              suggestions={suggestions}
              onSelect={handleSelect}
              isVisible={showSuggestions}
            />
          </div>
        )}

        {selectedDrug && (
          <div className="mt-6 space-y-4">
            <DrugSearchCard
              drug={selectedDrug}
              profile={reactionProfile}
              isLoading={isLoadingProfile}
            />

            <Button
              onClick={handleProceed}
              size="lg"
              className="w-full"
              icon={<ArrowRight size={20} />}
            >
              Assess Reaction
            </Button>
          </div>
        )}
      </GlassPanel>

      {/* Tools */}
      <div className="w-full max-w-2xl mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/compatibility">
          <GlassPanel className="p-5 cursor-pointer hover:shadow-md transition-shadow" intensity="light">
            <div className="flex items-center gap-3 mb-2">
              <Syringe size={20} className="text-[#4E6F4E]" />
              <h3 className="font-bold text-[#4E6F4E]">Y-Site Compatibility</h3>
            </div>
            <p className="text-sm text-[#5A7A5A]">Check IV drug Y-site compatibility based on Trissel&apos;s data</p>
          </GlassPanel>
        </Link>
        <Link href="/titration">
          <GlassPanel className="p-5 cursor-pointer hover:shadow-md transition-shadow" intensity="light">
            <div className="flex items-center gap-3 mb-2">
              <Timer size={20} className="text-[#4E6F4E]" />
              <h3 className="font-bold text-[#4E6F4E]">Titration Scheduler</h3>
            </div>
            <p className="text-sm text-[#5A7A5A]">Step-wise infusion rate titration with active timers</p>
          </GlassPanel>
        </Link>
      </div>

      <p className="mt-6 text-xs text-[#5A7A5A]/70 text-center max-w-sm">
        Data sourced from RxNorm, openFDA, and DailyMed.
        Always verify with institutional protocols.
      </p>
    </div>
  );
}
