'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CTCAE_COLORS } from '@/lib/constants';
import type { ActionStep } from '@/types/decision.types';
import {
  Activity, AlertTriangle, Ambulance, ArrowUp, Clock, FileText,
  HeartPulse, Info, Octagon, PauseCircle, Phone, PhoneCall,
  Play, Syringe, XCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  'activity': Activity,
  'alert-triangle': AlertTriangle,
  'ambulance': Ambulance,
  'arrow-up': ArrowUp,
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

interface ActionCardProps {
  action: ActionStep;
}

export function ActionCard({ action }: ActionCardProps) {
  const Icon = ICON_MAP[action.icon] || Info;
  const color = CTCAE_COLORS[action.grade];

  const urgencyOpacity = action.urgency === 'immediate' ? '20' : action.urgency === 'soon' ? '10' : '05';

  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      className={cn(
        'rounded-2xl border-2 p-4 flex flex-col items-center text-center gap-2 cursor-pointer transition-shadow hover:shadow-md',
        action.urgency === 'immediate' && 'ring-1 ring-opacity-30'
      )}
      style={{
        borderColor: color,
        backgroundColor: `${color}${urgencyOpacity}`,
        ...(action.urgency === 'immediate' ? { ringColor: color } : {}),
      }}
      role="button"
      aria-label={`${action.action}: ${action.detail}`}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon size={24} style={{ color }} aria-hidden="true" />
      </div>
      <p className="font-bold text-sm text-gray-900 leading-tight">
        {action.action}
      </p>
      <p className="text-xs text-gray-600 leading-snug line-clamp-2">
        {action.detail}
      </p>
    </motion.div>
  );
}
