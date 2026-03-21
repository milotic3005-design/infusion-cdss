'use client';

import { Badge } from '@/components/ui/Badge';
import type { CTCAEGrade } from '@/types/grading.types';

interface GradeLabelProps {
  grade: CTCAEGrade;
}

export function GradeLabel({ grade }: GradeLabelProps) {
  return (
    <div className="flex items-center gap-3">
      <Badge grade={grade.grade} size="lg" />
      <div>
        <p className="font-bold text-gray-900">{grade.label}</p>
        <p className="text-sm text-gray-500">{grade.description}</p>
      </div>
    </div>
  );
}
