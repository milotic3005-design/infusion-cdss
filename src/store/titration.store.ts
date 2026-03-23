import { create } from 'zustand';
import { save, load, remove, isStale } from '@/lib/session-state';
import { COMPAT_STORAGE_KEYS, MAX_STATE_AGE_MS } from '@/lib/compatibility-constants';
import { generateId } from '@/lib/utils';
import type { TitrationProtocol, CompletedStep } from '@/types/titration.types';

interface TitrationState {
  protocol: TitrationProtocol | null;
  activeStepIndex: number;
  stepStartedAt: number | null;
  remainingSeconds: number;
  isPaused: boolean;
  isTimerExpired: boolean;
  completedSteps: CompletedStep[];
  sessionId: string | null;
  isRunning: boolean;
  patientWeightKg: number | null;

  selectProtocol: (protocol: TitrationProtocol) => void;
  setPatientWeight: (weightKg: number | null) => void;
  startStep: (stepIndex: number) => void;
  tick: () => void;
  pause: () => void;
  resume: () => void;
  acknowledgeStep: () => void;
  resetTitration: () => void;
  getCurrentStep: () => TitrationProtocol['steps'][number] | null;
  isProtocolComplete: () => boolean;
  getTotalElapsedSeconds: () => number;
}

function createInitialState() {
  return {
    protocol: null as TitrationProtocol | null,
    activeStepIndex: 0,
    stepStartedAt: null as number | null,
    remainingSeconds: 0,
    isPaused: false,
    isTimerExpired: false,
    completedSteps: [] as CompletedStep[],
    sessionId: null as string | null,
    isRunning: false,
    patientWeightKg: null as number | null,
  };
}

type InitialState = ReturnType<typeof createInitialState>;

function persistState(state: InitialState) {
  save(COMPAT_STORAGE_KEYS.TITRATION_STATE, {
    protocol: state.protocol,
    activeStepIndex: state.activeStepIndex,
    stepStartedAt: state.stepStartedAt,
    remainingSeconds: state.remainingSeconds,
    isPaused: state.isPaused,
    completedSteps: state.completedSteps,
    sessionId: state.sessionId,
    isRunning: state.isRunning,
  });
}

function hydrateState() {
  if (isStale(COMPAT_STORAGE_KEYS.TITRATION_STATE, MAX_STATE_AGE_MS)) return null;
  const saved = load<InitialState>(COMPAT_STORAGE_KEYS.TITRATION_STATE);
  if (!saved?.protocol || !saved?.sessionId) return null;

  if (saved.isRunning && !saved.isPaused && saved.stepStartedAt) {
    const currentStep = saved.protocol.steps[saved.activeStepIndex];
    if (currentStep && currentStep.durationMinutes > 0) {
      const totalStepSeconds = currentStep.durationMinutes * 60;
      const elapsedSeconds = Math.floor((Date.now() - saved.stepStartedAt) / 1000);
      saved.remainingSeconds = Math.max(0, totalStepSeconds - elapsedSeconds);
      if (saved.remainingSeconds === 0) {
        saved.isTimerExpired = true;
      }
    }
  }
  return saved;
}

export const useTitrationStore = create<TitrationState>((set, get) => {
  const hydrated = hydrateState();
  const initial = hydrated ? { ...createInitialState(), ...hydrated } : createInitialState();

  return {
    ...initial,

    selectProtocol: (protocol) => {
      const newState = {
        ...createInitialState(),
        protocol,
        sessionId: generateId(),
      };
      set(newState);
      persistState(newState);
    },

    setPatientWeight: (weightKg) => {
      set({ patientWeightKg: weightKg });
      persistState(get() as unknown as InitialState);
    },

    startStep: (stepIndex) => {
      const { protocol } = get();
      if (!protocol) return;
      const step = protocol.steps[stepIndex];
      if (!step) return;
      const totalSeconds = step.durationMinutes * 60;
      const newState = {
        activeStepIndex: stepIndex,
        stepStartedAt: Date.now(),
        remainingSeconds: totalSeconds,
        isPaused: false,
        isTimerExpired: step.durationMinutes === 0,
        isRunning: step.durationMinutes > 0,
      };
      set(newState);
      persistState({ ...get() } as InitialState);
    },

    tick: () => {
      const state = get();
      if (state.isPaused || state.isTimerExpired || !state.isRunning) return;
      const newRemaining = Math.max(0, state.remainingSeconds - 1);
      const isExpired = newRemaining === 0;
      set({ remainingSeconds: newRemaining, isTimerExpired: isExpired, isRunning: !isExpired });
      if (newRemaining % 5 === 0 || isExpired) {
        persistState({ ...get(), remainingSeconds: newRemaining, isTimerExpired: isExpired, isRunning: !isExpired } as InitialState);
      }
    },

    pause: () => {
      set({ isPaused: true, isRunning: false });
      persistState(get() as unknown as InitialState);
    },

    resume: () => {
      const state = get();
      if (state.isTimerExpired || !state.protocol) return;
      set({
        isPaused: false,
        isRunning: true,
        stepStartedAt: Date.now() - ((state.protocol.steps[state.activeStepIndex].durationMinutes * 60 - state.remainingSeconds) * 1000),
      });
      persistState(get() as unknown as InitialState);
    },

    acknowledgeStep: () => {
      const state = get();
      if (!state.protocol) return;
      const currentStep = state.protocol.steps[state.activeStepIndex];
      const completedStep: CompletedStep = {
        stepNumber: currentStep.stepNumber,
        rateMlHr: currentStep.rateMlHr,
        durationMinutes: currentStep.durationMinutes,
        startedAt: state.stepStartedAt ?? Date.now(),
        completedAt: Date.now(),
      };
      const newCompleted = [...state.completedSteps, completedStep];
      const nextIndex = state.activeStepIndex + 1;
      const isProtocolComplete = nextIndex >= state.protocol.steps.length;

      if (isProtocolComplete) {
        set({ completedSteps: newCompleted, isTimerExpired: false, isRunning: false, remainingSeconds: 0 });
      } else {
        set({ completedSteps: newCompleted, activeStepIndex: nextIndex, isTimerExpired: false, isRunning: false, remainingSeconds: 0, stepStartedAt: null, isPaused: false });
      }
      persistState(get() as unknown as InitialState);
    },

    resetTitration: () => {
      set(createInitialState());
      remove(COMPAT_STORAGE_KEYS.TITRATION_STATE);
    },

    getCurrentStep: () => {
      const { protocol, activeStepIndex } = get();
      if (!protocol) return null;
      return protocol.steps[activeStepIndex] || null;
    },

    isProtocolComplete: () => {
      const { protocol, completedSteps } = get();
      if (!protocol) return false;
      return completedSteps.length >= protocol.steps.length;
    },

    getTotalElapsedSeconds: () => {
      const { completedSteps } = get();
      return completedSteps.reduce((sum, step) => {
        if (step.startedAt && step.completedAt) {
          return sum + Math.floor((step.completedAt - step.startedAt) / 1000);
        }
        return sum;
      }, 0);
    },
  };
});
