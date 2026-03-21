'use client';

import { useSessionStore } from '@/store/session.store';
import { Input } from '@/components/ui/Input';
import { Heart, Thermometer, Droplets, Wind, Activity } from 'lucide-react';

export function VitalSignsInput() {
  const vitalSigns = useSessionStore((s) => s.vitalSigns);
  const updateVitals = useSessionStore((s) => s.updateVitals);

  const handleChange = (field: string, value: string) => {
    const num = value === '' ? undefined : parseFloat(value);
    updateVitals({ [field]: num });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
        Vital Signs
      </h3>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="flex items-start gap-2">
          <Droplets size={18} className="text-red-400 mt-3 flex-shrink-0" aria-hidden="true" />
          <div className="flex-1 flex gap-2">
            <Input
              label="Systolic BP"
              type="number"
              placeholder="120"
              unit="mmHg"
              min={40}
              max={300}
              value={vitalSigns.systolicBP ?? ''}
              onChange={(e) => handleChange('systolicBP', e.target.value)}
            />
            <Input
              label="Diastolic"
              type="number"
              placeholder="80"
              unit="mmHg"
              min={20}
              max={200}
              value={vitalSigns.diastolicBP ?? ''}
              onChange={(e) => handleChange('diastolicBP', e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Heart size={18} className="text-pink-400 mt-3 flex-shrink-0" aria-hidden="true" />
          <Input
            label="Heart Rate"
            type="number"
            placeholder="72"
            unit="bpm"
            min={20}
            max={250}
            value={vitalSigns.heartRate ?? ''}
            onChange={(e) => handleChange('heartRate', e.target.value)}
          />
        </div>

        <div className="flex items-start gap-2">
          <Thermometer size={18} className="text-orange-400 mt-3 flex-shrink-0" aria-hidden="true" />
          <Input
            label="Temperature"
            type="number"
            placeholder="37.0"
            unit="°C"
            step="0.1"
            min={30}
            max={45}
            value={vitalSigns.temperature ?? ''}
            onChange={(e) => handleChange('temperature', e.target.value)}
          />
        </div>

        <div className="flex items-start gap-2">
          <Activity size={18} className="text-blue-400 mt-3 flex-shrink-0" aria-hidden="true" />
          <Input
            label="SpO2"
            type="number"
            placeholder="98"
            unit="%"
            min={50}
            max={100}
            value={vitalSigns.spO2 ?? ''}
            onChange={(e) => handleChange('spO2', e.target.value)}
          />
        </div>

        <div className="flex items-start gap-2">
          <Wind size={18} className="text-teal-400 mt-3 flex-shrink-0" aria-hidden="true" />
          <Input
            label="Respiratory Rate"
            type="number"
            placeholder="16"
            unit="/min"
            min={4}
            max={60}
            value={vitalSigns.respiratoryRate ?? ''}
            onChange={(e) => handleChange('respiratoryRate', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
