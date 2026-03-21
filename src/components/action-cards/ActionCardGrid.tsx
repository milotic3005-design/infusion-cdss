'use client';

import { ActionCard } from './ActionCard';
import type { ActionStep } from '@/types/decision.types';

interface ActionCardGridProps {
  actions: ActionStep[];
}

export function ActionCardGrid({ actions }: ActionCardGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {actions.map((action) => (
        <ActionCard key={action.id} action={action} />
      ))}
    </div>
  );
}
