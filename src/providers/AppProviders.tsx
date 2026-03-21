'use client';

import { QueryProvider } from './QueryProvider';
import type { ReactNode } from 'react';

export function AppProviders({ children }: { children: ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}
