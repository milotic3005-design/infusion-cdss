'use client';

import { Card } from '@/components/ui/Card';
import { Pill, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import type { DrugInfo } from '@/types/drug.types';
import type { ReactionProfile } from '@/types/reaction.types';

interface DrugSearchCardProps {
  drug: DrugInfo;
  profile: ReactionProfile | null;
  isLoading: boolean;
  compact?: boolean;
}

export function DrugSearchCard({ drug, profile, isLoading, compact }: DrugSearchCardProps) {
  return (
    <Card className={compact ? 'p-3' : 'p-5'}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <Pill size={20} className="text-blue-600" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 capitalize">{drug.genericName}</h3>
          {drug.brandNames.length > 0 && (
            <p className="text-sm text-gray-500 truncate">
              {drug.brandNames.join(', ')}
            </p>
          )}
          {drug.drugClasses.length > 0 && (
            <p className="text-xs text-gray-500 mt-0.5">
              {drug.drugClasses.map((c) => c.className).join(', ')}
            </p>
          )}
        </div>
        <div className="flex-shrink-0">
          {isLoading ? (
            <Loader2 size={18} className="animate-spin text-blue-500" />
          ) : profile ? (
            <div className="flex items-center gap-1.5">
              {profile.sources.rxnorm && <CheckCircle size={14} className="text-green-500" />}
              {profile.sources.openfda && <CheckCircle size={14} className="text-green-500" />}
              {profile.sources.dailymed && <CheckCircle size={14} className="text-green-500" />}
              {!profile.sources.rxnorm && !profile.sources.openfda && !profile.sources.dailymed && (
                <AlertCircle size={14} className="text-amber-500" />
              )}
            </div>
          ) : null}
        </div>
      </div>

      {!compact && profile?.protocol && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Reaction incidence: <span className="font-semibold">{profile.protocol.reactionIncidence}%</span>
            {profile.protocol.firstInfusionRisk === 'elevated' && (
              <span className="ml-2 text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full">
                Elevated first-infusion risk
              </span>
            )}
          </p>
        </div>
      )}
    </Card>
  );
}
