'use client';

import { Handle, Position } from '@xyflow/react';
import { CTCAE_COLORS } from '@/lib/constants';
import {
  Activity, AlertTriangle, Ambulance, ArrowUp, Clock, FileText,
  HeartPulse, Info, Octagon, PauseCircle, Phone, PhoneCall,
  Play, Syringe, XCircle, Building,
} from 'lucide-react';
import type { DecisionNodeData } from '@/types/decision.types';

const ICONS: Record<string, React.ElementType> = {
  'activity': Activity,
  'alert-triangle': AlertTriangle,
  'ambulance': Ambulance,
  'arrow-up': ArrowUp,
  'building': Building,
  'clock': Clock,
  'file-text': FileText,
  'heart-pulse': HeartPulse,
  'info': Info,
  'octagon': Octagon,
  'pause-circle': PauseCircle,
  'phone': Phone,
  'phone-call': PhoneCall,
  'play': Play,
  'syringe': Syringe,
  'x-circle': XCircle,
};

export function ActionNode({ data }: { data: Record<string, unknown> }) {
  const nodeData = data as unknown as DecisionNodeData;
  const Icon = ICONS[nodeData.icon || 'info'] || Info;
  const color = nodeData.grade ? CTCAE_COLORS[nodeData.grade] : '#6b7280';

  return (
    <div
      className="rounded-xl px-4 py-3 min-w-[160px] max-w-[200px] shadow-sm"
      style={{
        backgroundColor: `${color}15`,
        border: `2px solid ${color}`,
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-300 !w-2 !h-2" />
      <div className="flex items-center gap-2">
        <Icon size={16} style={{ color }} aria-hidden="true" />
        <span className="text-sm font-bold leading-tight" style={{ color: nodeData.isHighlighted ? '#1f2937' : '#6b7280' }}>
          {nodeData.label}
        </span>
      </div>
      {nodeData.description && (
        <p className="text-xs text-gray-600 mt-1">{nodeData.description}</p>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-gray-300 !w-2 !h-2" />
    </div>
  );
}
