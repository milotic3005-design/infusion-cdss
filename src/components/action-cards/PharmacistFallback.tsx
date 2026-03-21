'use client';

import { Card } from '@/components/ui/Card';
import { Phone, AlertCircle } from 'lucide-react';

export function PharmacistFallback() {
  return (
    <Card className="border-amber-200 bg-amber-50 p-6">
      <div className="flex flex-col items-center text-center gap-3">
        <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
          <AlertCircle size={28} className="text-amber-600" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-bold text-amber-900">Consult Pharmacist</h3>
        <p className="text-sm text-amber-700 max-w-sm">
          No verified drug data available from any source. Do not proceed based on unverified information.
        </p>
        <div className="flex items-center gap-2 mt-2 text-amber-800 font-semibold">
          <Phone size={18} />
          <span>Contact pharmacy immediately</span>
        </div>
      </div>
    </Card>
  );
}
