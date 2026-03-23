'use client';

import { Card } from '@/components/ui/Card';
import { Shield, Syringe, Clock, AlertTriangle, Info, Gauge } from 'lucide-react';
import type { DrugProtocol } from '@/types/reaction.types';

interface DrugReactionCardProps {
  protocol: DrugProtocol;
  drugName: string;
}

export function DrugReactionCard({ protocol, drugName }: DrugReactionCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <Shield size={20} className="text-blue-600" aria-hidden="true" />
        <h3 className="font-bold text-gray-900 capitalize">{drugName} Protocol</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
          {protocol.reactionIncidence}% incidence
        </span>
      </div>

      {/* Premedication checklist */}
      {protocol.premeds.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Syringe size={16} className="text-purple-500" aria-hidden="true" />
            <span className="text-sm font-semibold text-gray-700">Premedication</span>
          </div>
          <ul className="space-y-1.5" aria-label="Premedication list">
            {protocol.premeds.map((med, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-600 pl-6">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                <span>
                  <span className="font-medium">{med.medication}</span> {med.dose}
                  <span className="text-gray-500"> — {med.timing}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Infusion rates */}
      {protocol.infusionRates.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Gauge size={16} className="text-[#4E6F4E]" aria-hidden="true" />
            <span className="text-sm font-semibold text-gray-700">Standard Infusion Rates</span>
          </div>
          <div className="space-y-2 pl-6" aria-label="Infusion rate schedule">
            {protocol.infusionRates.map((rate, i) => (
              <div key={i} className="text-sm text-gray-600 border-l-2 border-[#C1E1B1] pl-3 py-1">
                <p className="font-medium text-[#4E6F4E]">{rate.setting}</p>
                <p>
                  Start: <span className="font-medium">{rate.initialRate}</span>
                  {rate.maxRate !== rate.initialRate && <> → Max: <span className="font-medium">{rate.maxRate}</span></>}
                </p>
                {rate.stepUp && <p className="text-xs text-gray-500">{rate.stepUp}</p>}
                {rate.duration && <p className="text-xs text-gray-500">Duration: {rate.duration}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rate adjustments */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center gap-1.5 mb-1">
          <Clock size={16} className="text-amber-500" aria-hidden="true" />
          <span className="text-sm font-semibold text-gray-700">Rate Adjustment</span>
        </div>
        <p className="text-sm text-gray-600 pl-6">
          <span className="font-medium text-amber-700">Grade 2:</span> {protocol.rateAdjustment.grade2}
        </p>
        <p className="text-sm text-gray-600 pl-6">
          <span className="font-medium text-red-700">Grade 3+:</span> {protocol.rateAdjustment.grade3Plus}
        </p>
      </div>

      {/* Risk indicators */}
      <div className="flex flex-wrap gap-2 mb-3">
        {protocol.firstInfusionRisk === 'elevated' && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
            <AlertTriangle size={12} />
            Elevated first-infusion risk
          </span>
        )}
        {protocol.desensitizationAvailable && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200">
            <Info size={12} />
            Desensitization available
          </span>
        )}
      </div>

      {/* Special notes */}
      {protocol.specialNotes.length > 0 && (
        <div className="pt-3 border-t border-gray-100">
          <ul className="space-y-1" aria-label="Special notes">
            {protocol.specialNotes.map((note, i) => (
              <li key={i} className="text-xs text-gray-500 pl-3 relative before:content-[''] before:absolute before:left-0 before:top-1.5 before:w-1 before:h-1 before:rounded-full before:bg-gray-300">
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
