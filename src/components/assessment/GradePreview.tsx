'use client';

import { useDecisionEngine } from '@/hooks/useDecisionEngine';
import { Badge } from '@/components/ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';

export function GradePreview() {
  const result = useDecisionEngine();

  return (
    <AnimatePresence>
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-gray-200 px-4 py-3 safe-bottom"
        >
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge
                grade={result.gradingResult.finalGrade.grade}
                label={`Grade ${result.gradingResult.finalGrade.grade}`}
                size="lg"
              />
              <div>
                <p className="font-semibold text-gray-900">
                  {result.gradingResult.finalGrade.label}
                </p>
                <p className="text-xs text-gray-500">
                  {result.gradingResult.contributingSymptoms.length} symptom(s) &middot;{' '}
                  Confidence: {result.gradingResult.confidence}
                </p>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-700">
              {result.actions[0]?.action}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
