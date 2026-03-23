const STORAGE_PREFIX = 'oic-cdss';

export function isStorageAvailable(): boolean {
  try {
    const testKey = `${STORAGE_PREFIX}:__test__`;
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function save(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    localStorage.setItem(`${key}:lastSaved`, String(Date.now()));
    return true;
  } catch {
    return false;
  }
}

export function load<T = unknown>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    try { localStorage.removeItem(key); } catch { /* ignore */ }
    return null;
  }
}

export function remove(key: string): void {
  try {
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}:lastSaved`);
  } catch { /* ignore */ }
}

export function isStale(key: string, maxAgeMs: number): boolean {
  try {
    const ts = localStorage.getItem(`${key}:lastSaved`);
    if (!ts) return true;
    return (Date.now() - Number(ts)) > maxAgeMs;
  } catch {
    return true;
  }
}
