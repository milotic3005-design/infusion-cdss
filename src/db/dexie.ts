import Dexie, { type Table } from 'dexie';
import type { ReactionProfile } from '@/types/reaction.types';
import type { SessionRecord } from '@/types/session.types';

export interface CachedDrugProfile extends ReactionProfile {
  id?: number;
}

export interface MetadataEntry {
  key: string;
  value: string | number | boolean;
}

export class InfusionCDSSDatabase extends Dexie {
  drugProfiles!: Table<CachedDrugProfile, number>;
  sessions!: Table<SessionRecord, string>;
  metadata!: Table<MetadataEntry, string>;

  constructor() {
    super('infusion-cdss');
    this.version(1).stores({
      drugProfiles: '++id, cacheKey, drug.rxcui, drug.genericName, fetchedAt',
      sessions: 'id, startedAt, drugRxcui',
      metadata: 'key',
    });
  }
}

export const db = new InfusionCDSSDatabase();
