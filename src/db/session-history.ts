import { db } from './dexie';
import type { SessionRecord } from '@/types/session.types';

export async function saveSession(session: SessionRecord): Promise<void> {
  try {
    await db.sessions.put(session);
  } catch (error) {
    console.error('Failed to save session:', error);
  }
}

export async function getRecentSessions(limit: number = 20): Promise<SessionRecord[]> {
  try {
    return await db.sessions
      .orderBy('startedAt')
      .reverse()
      .limit(limit)
      .toArray();
  } catch {
    return [];
  }
}

export async function clearSessionHistory(): Promise<void> {
  try {
    await db.sessions.clear();
  } catch (error) {
    console.error('Failed to clear session history:', error);
  }
}
