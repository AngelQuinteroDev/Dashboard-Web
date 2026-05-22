'use client';

import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import OverviewSection from '@/components/sections/OverviewSection';
import LeaderboardSection from '@/components/sections/LeaderboardSection';
import SessionsSection from '@/components/sections/SessionsSection';
import PlayersSection from '@/components/sections/PlayersSection';
import AnalyticsSection from '@/components/sections/AnalyticsSection';
import PerformanceSection from '@/components/sections/PerformanceSection';
import HeatmapsSection from '@/components/sections/HeatmapsSection';
import TrendsSection from '@/components/sections/TrendsSection';
import SettingsSection from '@/components/sections/SettingsSection';
import { DashboardSkeleton } from '@/components/Skeletons';
import {
  useSessions,
  useHighscores,
  useGlobalMetrics,
  usePlayerMetrics,
  useTrends,
  useHeatmap,
  useFirestoreConnection,
} from '@/hooks/useFirebase';
import { SidebarSection } from '@/types';
import { filterSessionsByDateRange } from '@/utils/metrics';

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState<SidebarSection>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dateRange, setDateRange] = useState('all');
  const [selectedPlayerFromSearch, setSelectedPlayerFromSearch] = useState<string | null>(null);

 
  const { sessions: allSessions, loading: sessionsLoading, error: sessionsError } = useSessions();
  const { highscores, loading: highscoresLoading } = useHighscores();
  const { isConnected, lastUpdate } = useFirestoreConnection();

  
  const sessions = useMemo(
    () => filterSessionsByDateRange(allSessions, dateRange),
    [allSessions, dateRange]
  );


  const globalMetrics = useGlobalMetrics(sessions);
  const players = usePlayerMetrics(sessions);
  const trends = useTrends(sessions, 30);
  const heatmapData = useHeatmap(sessions);

  
  const playerNames = useMemo(
    () => [...new Set(allSessions.map((s) => s.playerName))],
    [allSessions]
  );

  const isLoading = sessionsLoading || highscoresLoading;

 
  const handlePlayerSearch = (name: string) => {
    setSelectedPlayerFromSearch(name);
    setActiveSection('players');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] bg-grid-pattern">
      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div
        className="transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? 72 : 240 }}
      >
        {/* Header */}
        <Header
          isConnected={isConnected}
          lastUpdate={lastUpdate}
          playerNames={playerNames}
          onPlayerSearch={handlePlayerSearch}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Content Area */}
        <main className="p-4 md:p-6 lg:p-8">
          {/* Error State */}
          {sessionsError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-[#f43f5e]/10 border border-[#f43f5e]/20 text-sm text-[#f43f5e]"
            >
              <p className="font-medium">Connection Error</p>
              <p className="text-xs mt-1 text-[#f43f5e]/70">
                {sessionsError.message}. Make sure your Firebase configuration is correct in <code>.env.local</code>
              </p>
            </motion.div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <DashboardSkeleton />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {activeSection === 'overview' && (
                  <OverviewSection
                    sessions={sessions}
                    metrics={globalMetrics}
                    trends={trends}
                    highscores={highscores}
                  />
                )}

                {activeSection === 'leaderboard' && (
                  <LeaderboardSection highscores={highscores} />
                )}

                {activeSection === 'sessions' && (
                  <SessionsSection
                    sessions={sessions}
                    globalMetrics={globalMetrics}
                  />
                )}

                {activeSection === 'players' && (
                  <PlayersSection
                    players={players}
                    globalMetrics={globalMetrics}
                  />
                )}

                {activeSection === 'analytics' && (
                  <AnalyticsSection
                    sessions={sessions}
                    players={players}
                    metrics={globalMetrics}
                  />
                )}

                {activeSection === 'performance' && (
                  <PerformanceSection
                    sessions={sessions}
                    metrics={globalMetrics}
                    players={players}
                  />
                )}

                {activeSection === 'heatmaps' && (
                  <HeatmapsSection
                    heatmapData={heatmapData}
                    sessions={sessions}
                  />
                )}

                {activeSection === 'trends' && (
                  <TrendsSection
                    trends={trends}
                    sessions={sessions}
                    metrics={globalMetrics}
                  />
                )}

                {activeSection === 'settings' && <SettingsSection />}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarCollapsed(true)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
