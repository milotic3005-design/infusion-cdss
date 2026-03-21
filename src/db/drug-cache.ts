import { db } from './dexie';
import type { ReactionProfile } from '@/types/reaction.types';
import { CACHE_TTL, COMMON_INFUSION_DRUGS } from '@/lib/constants';

export async function getCachedProfile(cacheKey: string): Promise<ReactionProfile | null> {
  try {
    const record = await db.drugProfiles.where('cacheKey').equals(cacheKey).first();
    if (!record) return null;

    // Check TTL
    const isCommon = COMMON_INFUSION_DRUGS.some((d) =>
      cacheKey.toLowerCase().includes(d)
    );
    const ttl = isCommon ? CACHE_TTL.indexedDBCommon : CACHE_TTL.indexedDBOther;

    if (Date.now() - record.fetchedAt > ttl) {
      return null; // Expired
    }

    return record;
  } catch {
    return null;
  }
}

export async function setCachedProfile(profile: ReactionProfile): Promise<void> {
  try {
    // Upsert: delete existing, insert new
    await db.drugProfiles.where('cacheKey').equals(profile.cacheKey).delete();
    await db.drugProfiles.add(profile);
  } catch (error) {
    console.error('Failed to cache drug profile:', error);
  }
}

export async function clearExpiredProfiles(): Promise<void> {
  try {
    const now = Date.now();
    const allProfiles = await db.drugProfiles.toArray();

    const expiredIds: number[] = [];
    for (const profile of allProfiles) {
      const isCommon = COMMON_INFUSION_DRUGS.some((d) =>
        profile.cacheKey.toLowerCase().includes(d)
      );
      const ttl = isCommon ? CACHE_TTL.indexedDBCommon : CACHE_TTL.indexedDBOther;

      if (now - profile.fetchedAt > ttl && profile.id !== undefined) {
        expiredIds.push(profile.id);
      }
    }

    if (expiredIds.length > 0) {
      await db.drugProfiles.bulkDelete(expiredIds);
    }
  } catch (error) {
    console.error('Failed to clear expired profiles:', error);
  }
}
