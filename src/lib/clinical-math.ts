export function roundClinical(value: number): number {
  if (typeof value !== 'number' || !isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}

export function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function calculateVolumeDelivered(rateMlHr: number, durationMinutes: number): number {
  return roundClinical(rateMlHr * durationMinutes / 60);
}
