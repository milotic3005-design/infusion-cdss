'use client';

import { useState, useCallback, useRef } from 'react';
import { CheckCircle, Clock, ChevronRight, StopCircle } from 'lucide-react';
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
import type { TitrationProtocol } from '@/types/titration.types';

export function TitrationSchedulePanel() {
  const protocol = useTitrationStore((s) => s.protocol);
  const activeStepIndex = useTitrationStore((s) => s.activeStepIndex);
  const remainingSeconds = useTitrationStore((s) => s.remainingSeconds);
  const isPaused = useTitrationStore((s) => s.isPaused);
  const isTimerExpired = useTitrationStore((s) => s.isTimerExpired);
  const isRunning = useTitrationStore((s) => s.isRunning);
  const completedSteps = useTitrationStore((s) => s.completedSteps);
  const selectProtocol = useTitrationStore((s) => s.selectProtocol);
  const startStep = useTitrationStore((s) => s.startStep);
  const pause = useTitrationStore((s) => s.pause);
  const resume = useTitrationStore((s) => s.resume);
  const acknowledgeStep = useTitrationStore((s) => s.acknowledgeStep);
  const resetTitration = useTitrationStore((s) => s.resetTitration);
  const isProtocolComplete = useTitrationStore((s) => s.isProtocolComplete);
  const getTotalElapsedSeconds = useTitrationStore((s) => s.getTotalElapsedSeconds);

  const [showStopConfirm, setShowStopConfirm] = useState(false);
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
  }, [protocol, isRunning, selectProtocol, stopAlert]);

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
            {protocol.brandName && <span className="text-sm text-[#8AB78A]">({protocol.drugName})</span>}
          </div>
          {protocol.genericName && <p className="text-xs text-[#8AB78A] italic">{protocol.genericName}</p>}
          <p className="text-sm text-gray-500">{protocol.indication}</p>
        </div>
        <Button variant="ghost" onClick={() => { if (isRunning || completedSteps.length > 0) { setShowStopConfirm(true); } else { resetTitration(); } }} size="sm">Change Protocol</Button>
      </div>

      {/* Premeds */}
      {protocol.premeds && (
        <Card className="bg-amber-50 border-amber-200">
          <p className="text-sm font-semibold text-amber-800 mb-1">Premedications Required</p>
          <p className="text-sm text-amber-700">{protocol.premeds}</p>
        </Card>
      )}

      {/* Step list */}
      <div className="space-y-2">
        {protocol.steps.map((step, index) => {
          const isCompleted = index < completedSteps.length;
          const isActive = index === activeStepIndex && !protocolComplete;
          const isUpcoming = index > activeStepIndex;
          const completedInfo = completedSteps[index];

          return (
            <div key={step.stepNumber}>
              {isActive && !stepNotStarted && (isRunning || isPaused || isTimerExpired) ? (
                <TitrationStepTimer step={step} remainingSeconds={remainingSeconds} totalSeconds={totalSeconds} isExpired={isTimerExpired} isPaused={isPaused} onPause={pause} onResume={resume} soundBlocked={isBlocked()} onEnableSound={enableSound} />
              ) : (
                <Card className={cn('flex items-center gap-3 py-3', isCompleted && 'border-l-4 border-l-green-600 bg-green-50', isActive && 'border-l-4 border-l-[#4E6F4E] bg-[#E9F5E1]', isUpcoming && 'border-l-4 border-l-gray-300 opacity-60')} padding="sm">
                  <div className="shrink-0">
                    {isCompleted ? <CheckCircle size={22} className="text-green-600" /> : isActive ? <Clock size={22} className="text-[#4E6F4E]" /> : <ChevronRight size={22} className="text-gray-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-semibold', isCompleted && 'text-green-800', isActive && 'text-[#4E6F4E]', isUpcoming && 'text-gray-500')}>
                      Step {step.stepNumber}: {step.rateMlHr} mL/hr{step.durationMinutes > 0 ? ` \u00d7 ${step.durationMinutes} min` : ' \u2014 until complete'}
                    </p>
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
          <Button variant="secondary" onClick={resetTitration} className="mt-4">Start New Protocol</Button>
        </Card>
      )}

      {/* Summary footer */}
      {!protocolComplete && completedSteps.length > 0 && (
        <div className="flex items-center justify-between text-sm text-[#8AB78A] px-1">
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
