'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { CheckCircle, Clock, ChevronRight, StopCircle, Scale, Info } from 'lucide-react';
import { useTitrationStore } from '@/store/titration.store';
import { useCountdown } from '@/hooks/useCountdown';
import { useAudibleAlert } from '@/hooks/useAudibleAlert';
import { formatDuration, roundClinical } from '@/lib/clinical-math';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProtocolSelector } from './ProtocolSelector';
import { TitrationStepTimer } from './TitrationStepTimer';
import { StepAcknowledgeModal } from './StepAcknowledgeModal';
import type { TitrationProtocol, TitrationStep } from '@/types/titration.types';

/** Returns true if any step in the protocol has a weight-based rate */
function isWeightBased(protocol: TitrationProtocol): boolean {
  return protocol.steps.some((s) => s.rateMlKgHr != null && s.rateMlKgHr > 0);
}

/** Calculate the actual mL/hr rate for a step given patient weight */
function effectiveRate(step: TitrationStep, weightKg: number | null): number {
  if (step.rateMlKgHr != null && step.rateMlKgHr > 0 && weightKg && weightKg > 0) {
    return Math.round(step.rateMlKgHr * weightKg);
  }
  return step.rateMlHr;
}

export function TitrationSchedulePanel() {
  const protocol = useTitrationStore((s) => s.protocol);
  const activeStepIndex = useTitrationStore((s) => s.activeStepIndex);
  const remainingSeconds = useTitrationStore((s) => s.remainingSeconds);
  const isPaused = useTitrationStore((s) => s.isPaused);
  const isTimerExpired = useTitrationStore((s) => s.isTimerExpired);
  const isRunning = useTitrationStore((s) => s.isRunning);
  const completedSteps = useTitrationStore((s) => s.completedSteps);
  const patientWeightKg = useTitrationStore((s) => s.patientWeightKg);
  const selectProtocol = useTitrationStore((s) => s.selectProtocol);
  const setPatientWeight = useTitrationStore((s) => s.setPatientWeight);
  const startStep = useTitrationStore((s) => s.startStep);
  const pause = useTitrationStore((s) => s.pause);
  const resume = useTitrationStore((s) => s.resume);
  const acknowledgeStep = useTitrationStore((s) => s.acknowledgeStep);
  const resetTitration = useTitrationStore((s) => s.resetTitration);
  const isProtocolComplete = useTitrationStore((s) => s.isProtocolComplete);
  const getTotalElapsedSeconds = useTitrationStore((s) => s.getTotalElapsedSeconds);

  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const wasExpiredRef = useRef(false);

  useCountdown();
  const { play: playAlert, stop: stopAlert, isBlocked, enableSound } = useAudibleAlert();

  // Play/stop alert based on expiry
  if (isTimerExpired && !wasExpiredRef.current) { playAlert(); wasExpiredRef.current = true; }
  if (!isTimerExpired && wasExpiredRef.current) { stopAlert(); wasExpiredRef.current = false; }

  const handleAcknowledge = useCallback(() => { stopAlert(); wasExpiredRef.current = false; acknowledgeStep(); }, [stopAlert, acknowledgeStep]);
  const handleStartStep = useCallback((index: number) => { startStep(index); }, [startStep]);
  const handleStopInfusion = useCallback(() => { stopAlert(); wasExpiredRef.current = false; resetTitration(); setShowStopConfirm(false); }, [stopAlert, resetTitration]);

  const handleSelectProtocol = useCallback((proto: TitrationProtocol) => {
    if (protocol && isRunning) {
      if (!window.confirm('Changing protocol will reset the active timer. Continue?')) return;
      stopAlert();
    }
    selectProtocol(proto);
    setWeightInput('');
  }, [protocol, isRunning, selectProtocol, stopAlert]);

  const handleWeightApply = useCallback(() => {
    const raw = parseFloat(weightInput);
    if (isNaN(raw) || raw <= 0) return;
    const kg = weightUnit === 'lbs' ? raw / 2.205 : raw;
    if (kg < 1 || kg > 500) return;
    setPatientWeight(Math.round(kg * 10) / 10);
  }, [weightInput, weightUnit, setPatientWeight]);

  const handleWeightClear = useCallback(() => {
    setPatientWeight(null);
    setWeightInput('');
  }, [setPatientWeight]);

  // Whether weight has been applied for a weight-based protocol
  const weightBasedProtocol = protocol ? isWeightBased(protocol) : false;
  const weightApplied = patientWeightKg != null && patientWeightKg > 0;

  // Effective step rates
  const effectiveSteps = useMemo(() => {
    if (!protocol) return [];
    return protocol.steps.map((step) => ({
      ...step,
      effectiveRateMlHr: effectiveRate(step, patientWeightKg),
    }));
  }, [protocol, patientWeightKg]);

  if (!protocol) return <ProtocolSelector onSelect={handleSelectProtocol} />;

  const protocolComplete = isProtocolComplete();
  const totalElapsed = getTotalElapsedSeconds();
  const currentStep = protocol.steps[activeStepIndex];
  const nextStep = protocol.steps[activeStepIndex + 1] || null;
  const isFinalStep = activeStepIndex >= protocol.steps.length - 1;
  const totalSeconds = currentStep ? currentStep.durationMinutes * 60 : 0;
  const stepNotStarted = !isRunning && !isPaused && !isTimerExpired && remainingSeconds === 0 && !protocolComplete;

  return (
    <div className="space-y-4">
      {/* Protocol header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-lg font-bold text-[#4E6F4E]">{protocol.brandName || protocol.drugName}</h2>
            {protocol.brandName && <span className="text-sm text-[#5A7A5A]">({protocol.drugName})</span>}
          </div>
          {protocol.genericName && <p className="text-xs text-[#5A7A5A] italic">{protocol.genericName}</p>}
          <p className="text-sm text-gray-500">{protocol.indication}</p>
        </div>
        <Button variant="ghost" onClick={() => { if (isRunning || completedSteps.length > 0) { setShowStopConfirm(true); } else { resetTitration(); } }} size="sm">Change Protocol</Button>
      </div>

      {/* Weight-based rate calculator */}
      {weightBasedProtocol && (
        <Card className={cn('border-[#8AB78A]/50', weightApplied ? 'bg-[#E9F5E1]/40' : 'bg-blue-50 border-blue-200')}>
          <div className="flex items-center gap-2 mb-2">
            <Scale size={18} className={weightApplied ? 'text-[#4E6F4E]' : 'text-blue-600'} />
            <h3 className={cn('text-sm font-bold', weightApplied ? 'text-[#4E6F4E]' : 'text-blue-800')}>
              Weight-Based Rate Calculator
            </h3>
          </div>

          {!weightApplied ? (
            <>
              <p className="text-xs text-blue-700 mb-3">
                This protocol uses weight-based dosing (mL/kg/hr). Enter the patient&apos;s weight to calculate exact rates.
              </p>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label htmlFor="patient-weight" className="text-xs font-medium text-gray-600 block mb-1">Patient Weight</label>
                  <input
                    id="patient-weight"
                    type="number"
                    inputMode="decimal"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleWeightApply(); }}
                    placeholder={weightUnit === 'kg' ? 'e.g. 70' : 'e.g. 154'}
                    className={cn(
                      'w-full min-h-[44px] px-3 py-2',
                      'rounded-xl border border-blue-200 bg-white text-base',
                      'placeholder:text-blue-300',
                      'focus:outline-none focus:ring-2 focus:ring-[#4E6F4E]'
                    )}
                    min="1"
                    max={weightUnit === 'kg' ? '500' : '1100'}
                    step="0.1"
                  />
                </div>
                <div className="flex rounded-xl border border-blue-200 overflow-hidden min-h-[44px]">
                  <button
                    onClick={() => setWeightUnit('kg')}
                    className={cn(
                      'px-3 py-2 text-sm font-medium transition-colors',
                      weightUnit === 'kg' ? 'bg-[#4E6F4E] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
                    )}
                  >kg</button>
                  <button
                    onClick={() => setWeightUnit('lbs')}
                    className={cn(
                      'px-3 py-2 text-sm font-medium transition-colors',
                      weightUnit === 'lbs' ? 'bg-[#4E6F4E] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
                    )}
                  >lbs</button>
                </div>
                <Button onClick={handleWeightApply} size="sm" disabled={!weightInput || parseFloat(weightInput) <= 0}>
                  Calculate
                </Button>
              </div>

              {/* Preview default rates */}
              <div className="mt-3 flex items-start gap-1.5">
                <Info size={14} className="text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-500">
                  Without patient weight, default rates for a ~60 kg reference patient will be used.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#4E6F4E]">
                    Patient weight: <strong>{patientWeightKg} kg</strong>
                    <span className="text-[#5A7A5A] ml-1">({Math.round(patientWeightKg! * 2.205)} lbs)</span>
                  </p>
                  <p className="text-xs text-[#5A7A5A] mt-0.5">
                    Rates below are calculated as mL/kg/hr × {patientWeightKg} kg
                  </p>
                </div>
                <button
                  onClick={handleWeightClear}
                  className="text-xs text-[#5A7A5A] hover:text-[#4E6F4E] min-h-[44px] px-3"
                >
                  Change weight
                </button>
              </div>

              {/* Rate comparison table */}
              <div className="mt-3 rounded-xl border border-[#C1E1B1] overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#E9F5E1]">
                      <th className="text-left py-1.5 px-2 font-semibold text-[#4E6F4E]">Step</th>
                      <th className="text-right py-1.5 px-2 font-semibold text-[#4E6F4E]">mL/kg/hr</th>
                      <th className="text-right py-1.5 px-2 font-semibold text-[#4E6F4E]">= mL/hr</th>
                      <th className="text-right py-1.5 px-2 font-semibold text-[#4E6F4E]">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {effectiveSteps.map((step) => (
                      <tr key={step.stepNumber} className="border-t border-[#C1E1B1]/50">
                        <td className="py-1.5 px-2 text-gray-700">Step {step.stepNumber}</td>
                        <td className="py-1.5 px-2 text-right text-[#5A7A5A] font-medium">{step.rateMlKgHr ?? '—'}</td>
                        <td className="py-1.5 px-2 text-right font-bold text-[#4E6F4E]">{step.effectiveRateMlHr}</td>
                        <td className="py-1.5 px-2 text-right text-gray-500">{step.durationMinutes > 0 ? `${step.durationMinutes} min` : '→ done'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Card>
      )}

      {/* Premeds */}
      {protocol.premeds && (
        <Card className="bg-amber-50 border-amber-200">
          <p className="text-sm font-semibold text-amber-800 mb-1">Premedications Required</p>
          <p className="text-sm text-amber-700">{protocol.premeds}</p>
        </Card>
      )}

      {/* Step list */}
      <div className="space-y-2">
        {effectiveSteps.map((step, index) => {
          const isCompleted = index < completedSteps.length;
          const isActive = index === activeStepIndex && !protocolComplete;
          const isUpcoming = index > activeStepIndex;
          const completedInfo = completedSteps[index];
          const rateLabel = step.effectiveRateMlHr;
          const weightSuffix = step.rateMlKgHr != null && weightApplied
            ? ` (${step.rateMlKgHr} mL/kg/hr × ${patientWeightKg} kg)`
            : step.rateMlKgHr != null
              ? ` (${step.rateMlKgHr} mL/kg/hr)`
              : '';

          return (
            <div key={step.stepNumber}>
              {isActive && !stepNotStarted && (isRunning || isPaused || isTimerExpired) ? (
                <TitrationStepTimer step={step} remainingSeconds={remainingSeconds} totalSeconds={totalSeconds} isExpired={isTimerExpired} isPaused={isPaused} onPause={pause} onResume={resume} soundBlocked={isBlocked()} onEnableSound={enableSound} />
              ) : (
                <Card className={cn('flex items-center gap-3 py-3', isCompleted && 'border-l-4 border-l-green-600 bg-green-50', isActive && 'border-l-4 border-l-[#4E6F4E] bg-[#E9F5E1]', isUpcoming && 'border-l-4 border-l-gray-300 opacity-60')} padding="sm">
                  <div className="shrink-0">
                    {isCompleted ? <CheckCircle size={22} className="text-green-600" /> : isActive ? <Clock size={22} className="text-[#4E6F4E]" /> : <ChevronRight size={22} className="text-gray-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-semibold', isCompleted && 'text-green-800', isActive && 'text-[#4E6F4E]', isUpcoming && 'text-gray-500')}>
                      Step {step.stepNumber}: {rateLabel} mL/hr{step.durationMinutes > 0 ? ` \u00d7 ${step.durationMinutes} min` : ' \u2014 until complete'}
                    </p>
                    {weightSuffix && (
                      <p className={cn('text-xs font-medium mt-0.5', isCompleted ? 'text-green-600' : isActive ? 'text-[#5A7A5A]' : 'text-gray-500')}>
                        {weightSuffix}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{step.triggerCondition}</p>
                    {isCompleted && completedInfo && (
                      <p className="text-xs text-green-600 mt-0.5">Completed in {formatDuration(Math.floor((completedInfo.completedAt - completedInfo.startedAt) / 1000))}</p>
                    )}
                  </div>
                  {isActive && stepNotStarted && (
                    <Button onClick={() => handleStartStep(index)} size="sm">{step.durationMinutes === 0 ? 'Begin Step' : 'Start Timer'}</Button>
                  )}
                  {isActive && step.durationMinutes === 0 && isTimerExpired && (
                    <Button onClick={handleAcknowledge} size="sm">Mark Complete</Button>
                  )}
                </Card>
              )}
            </div>
          );
        })}
      </div>

      {/* Protocol complete */}
      {protocolComplete && (
        <Card className="bg-green-50 border-green-300 text-center py-6">
          <CheckCircle size={40} className="text-green-600 mx-auto mb-2" />
          <h3 className="text-lg font-bold text-green-800">Infusion Complete</h3>
          <p className="text-sm text-green-600 mt-1">All {protocol.steps.length} steps completed in {formatDuration(totalElapsed)}</p>
          {weightApplied && <p className="text-xs text-green-500 mt-1">Patient weight: {patientWeightKg} kg</p>}
          <Button variant="secondary" onClick={resetTitration} className="mt-4">Start New Protocol</Button>
        </Card>
      )}

      {/* Summary footer */}
      {!protocolComplete && completedSteps.length > 0 && (
        <div className="flex items-center justify-between text-sm text-[#5A7A5A] px-1">
          <span>Steps: {completedSteps.length} / {protocol.steps.length}</span>
          <span>Elapsed: {formatDuration(totalElapsed)}</span>
          <span>Vol: ~{roundClinical(completedSteps.reduce((sum, s) => sum + (s.rateMlHr * s.durationMinutes) / 60, 0))} mL</span>
        </div>
      )}

      {/* Stop button */}
      {!protocolComplete && (isRunning || completedSteps.length > 0) && (
        <div className="flex justify-center pt-2">
          <Button variant="danger" onClick={() => setShowStopConfirm(true)} icon={<StopCircle size={18} />}>Stop Infusion</Button>
        </div>
      )}

      {/* Stop confirm */}
      {showStopConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
          <Card className="w-full max-w-sm text-center">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Stop Infusion?</h3>
            <p className="text-sm text-gray-600 mb-4">This will reset all timer progress and step history. This action cannot be undone.</p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowStopConfirm(false)}>Cancel</Button>
              <Button variant="danger" className="flex-1" onClick={handleStopInfusion}>Stop &amp; Reset</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Acknowledge modal */}
      {isTimerExpired && currentStep && currentStep.durationMinutes > 0 && (
        <StepAcknowledgeModal step={currentStep} nextStep={nextStep} isFinalStep={isFinalStep} onAcknowledge={handleAcknowledge} />
      )}
    </div>
  );
}
