'use client';

import { useEffect } from 'react';
import { useCompatibilityStore } from '@/store/compatibility.store';
import { CompatibilityDrugSelector } from '@/components/compatibility/CompatibilityDrugSelector';
import { CompatibilityResultCard } from '@/components/compatibility/CompatibilityResultCard';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CompatibilityPage() {
  const restoreLastResult = useCompatibilityStore((s) => s.restoreLastResult);
  useEffect(() => { restoreLastResult(); }, [restoreLastResult]);

  return (
    <div className="flex flex-col items-center pt-4 md:pt-8">
      <div className="w-full max-w-2xl mb-4">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[#8AB78A] hover:text-[#4E6F4E] transition-colors min-h-[44px]">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>

      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-2">
          <ShieldCheck size={24} className="text-[#4E6F4E]" />
          <h1 className="text-xl md:text-2xl font-bold text-[#4E6F4E]">Y-Site IV Compatibility Checker</h1>
        </div>
        <p className="text-[#8AB78A] text-sm">Select two IV drugs to check Y-site compatibility based on Trissel&apos;s classification.</p>
      </div>

      <GlassPanel className="w-full max-w-2xl p-6 md:p-8" intensity="medium">
        <CompatibilityDrugSelector />
        <CompatibilityResultCard />
      </GlassPanel>

      <p className="mt-6 text-xs text-[#8AB78A]/70 text-center max-w-sm">
        Data modeled after Trissel&apos;s Handbook on Injectable Drugs. For educational/demo purposes only.
      </p>
    </div>
  );
}
