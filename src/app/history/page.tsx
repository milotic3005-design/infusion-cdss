'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getRecentSessions } from '@/db/session-history';
import { formatTimestamp } from '@/lib/utils';
import { ArrowLeft, Clock, Trash2 } from 'lucide-react';
import type { SessionRecord } from '@/types/session.types';

export default function HistoryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getRecentSessions(20).then((data) => {
      setSessions(data);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={16} />
          Home
        </button>
        <h1 className="text-lg font-bold text-gray-900">Session History</h1>
        <div className="w-20" />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12">
          <Clock size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No previous sessions</p>
          <p className="text-xs text-gray-400 mt-1">Sessions will appear here after assessment</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <Card key={session.id} padding="sm" className="hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge grade={session.finalGrade} size="sm" />
                  <div>
                    <p className="font-semibold text-gray-900 capitalize">{session.drugName}</p>
                    <p className="text-xs text-gray-500">
                      {formatTimestamp(session.startedAt)} &middot;{' '}
                      {session.symptoms.filter((s) => s.isPresent).length} symptoms
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">
                    Grade {session.finalGrade}
                  </p>
                  <p className="text-xs text-gray-400">
                    {session.actionsTaken.length} actions
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
