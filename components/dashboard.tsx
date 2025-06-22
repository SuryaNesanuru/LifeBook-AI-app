'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar';
import { JournalEditor } from '@/components/journal-editor';
import { TimelineView } from '@/components/timeline-view';
import { AnalyticsView } from '@/components/analytics-view';
import { SearchView } from '@/components/search-view';

export type View = 'write' | 'timeline' | 'analytics' | 'search';

export function Dashboard() {
  const [currentView, setCurrentView] = useState<View>('write');

  const renderView = () => {
    switch (currentView) {
      case 'write':
        return <JournalEditor />;
      case 'timeline':
        return <TimelineView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'search':
        return <SearchView />;
      default:
        return <JournalEditor />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1 overflow-hidden">
        {renderView()}
      </main>
    </div>
  );
}