'use client';

import { TitrationSchedulePanel } from '@/components/titration/TitrationSchedulePanel';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { isStorageAvailable } from '@/lib/session-state';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TitrationPage() {
  const storageOk = isStorageAvailable();

  return (
    <div className="flex flex-col items-center pt-4 md:pt-8">
      <div className="w-full max-w-2xl mb-4">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[#5A7A5A] hover:text-[#4E6F4E] transition-colors min-h-[44px]">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>

      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-2">
          <ShieldCheck size={24} className="text-[#4E6F4E]" />
          <h1 className="text-xl md:text-2xl font-bold text-[#4E6F4E]">Biologic Titration Scheduler</h1>
        </div>
        <p className="text-[#5A7A5A] text-sm">Select a protocol to begin step-wise infusion rate titration with active timers.</p>
      </div>

      {!storageOk && (
        <div role="alert" className="w-full max-w-2xl mb-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-300 text-sm text-amber-800">
          Session persistence unavailable. Timer state will not survive page refresh in this browser mode.
        </div>
      )}

      <GlassPanel className="w-full max-w-2xl p-6 md:p-8" intensity="medium">
        <TitrationSchedulePanel />
      </GlassPanel>

      <p className="mt-6 text-xs text-[#5A7A5A]/70 text-center max-w-sm">
        All protocols are for educational/demo purposes. Verify against institutional protocols.
      </p>
    </div>
  );
}
