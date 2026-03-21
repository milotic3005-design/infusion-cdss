'use client';

import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { WifiOff } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export function OfflineBanner() {
  const isOffline = useOfflineStatus();

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-amber-50 border-b border-amber-200 overflow-hidden"
          role="alert"
        >
          <div className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-amber-800">
            <WifiOff className="h-4 w-4" />
            <span>Offline Mode — Using cached data</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
