'use client';

import { Handle, Position } from '@xyflow/react';
import { CTCAE_COLORS } from '@/lib/constants';
import { AlertTriangle, HelpCircle, Info } from 'lucide-react';
import type { DecisionNodeData } from '@/types/decision.types';

const ICONS: Record<string, React.ElementType> = {
  'alert-triangle': AlertTriangle,
  'help-circle': HelpCircle,
  'info': Info,
};

export function DecisionNode({ data }: { data: Record<string, unknown> }) {
  const nodeData = data as unknown as DecisionNodeData;
  const Icon = ICONS[nodeData.icon || 'info'] || Info;
  const color = nodeData.grade ? CTCAE_COLORS[nodeData.grade] : '#6b7280';

  return (
    <div
      className="rounded-xl border-2 bg-white px-4 py-3 shadow-sm min-w-[160px] max-w-[200px]"
      style={{ borderColor: nodeData.isHighlighted ? color : '#e5e7eb' }}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-300 !w-2 !h-2" />
      <div className="flex items-center gap-2">
        <Icon size={16} style={{ color }} aria-hidden="true" />
        <span className="text-sm font-semibold text-gray-900 leading-tight">
          {nodeData.label}
        </span>
      </div>
      {nodeData.description && (
        <p className="text-xs text-gray-500 mt-1">{nodeData.description}</p>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-gray-300 !w-2 !h-2" />
    </div>
  );
}
