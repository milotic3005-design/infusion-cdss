'use client';

import protocolData from '@/data/titration-protocols.json';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { TitrationProtocol } from '@/types/titration.types';

interface Props {
  onSelect: (protocol: TitrationProtocol) => void;
}

const protocols = protocolData.protocols as TitrationProtocol[];

export function ProtocolSelector({ onSelect }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-[#4E6F4E]">Select Titration Protocol</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {protocols.map((protocol) => (
          <button
            key={protocol.id}
            onClick={() => onSelect(protocol)}
            className="text-left w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8AB78A] rounded-2xl"
          >
            <Card className={cn('cursor-pointer hover:border-[#8AB78A] hover:shadow-md transition-all duration-150 min-h-[44px]')}>
              <div className="flex items-baseline gap-2">
                <h3 className="font-bold text-gray-800">{protocol.brandName || protocol.drugName}</h3>
                {protocol.brandName && <span className="text-xs text-[#8AB78A] font-medium">({protocol.drugName})</span>}
              </div>
              <p className="text-xs text-gray-400 mt-0.5 italic">{protocol.genericName}</p>
              <p className="text-sm text-gray-500 mt-1">{protocol.indication}</p>
              <div className="flex gap-4 mt-2 text-xs text-[#8AB78A]">
                <span>{protocol.steps.length} steps</span>
                <span>{protocol.diluentVolumeMl} mL in {protocol.diluent}</span>
              </div>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}
