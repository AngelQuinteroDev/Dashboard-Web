'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  Eye,
} from 'lucide-react';
import { Session, SessionFilters, GlobalMetrics } from '@/types';
import { formatDuration, formatDecimal, formatPercentage, exportSessionsToCSV } from '@/utils/metrics';
import { format } from 'date-fns';
import SessionDetailModal from '@/components/SessionDetailModal';

interface SessionsSectionProps {
  sessions: Session[];
  globalMetrics: GlobalMetrics;
}

const ITEMS_PER_PAGE = 15;

const defaultFilters: SessionFilters = {
  playerName: '',
  minScore: null,
  maxScore: null,
  reachedGoal: 'all',
  minDuration: null,
  maxDuration: null,
  minEfficiency: null,
  sortBy: 'startTime',
  sortOrder: 'desc',
  dateRange: 'all',
};

export default function SessionsSection({ sessions, globalMetrics }: SessionsSectionProps) {
  const [filters, setFilters] = useState<SessionFilters>(defaultFilters);
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  // Apply filters
  const filtered = useMemo(() => {
    let result = [...sessions];

    if (filters.playerName) {
      result = result.filter((s) =>
        s.playerName.toLowerCase().includes(filters.playerName.toLowerCase())
      );
    }
    if (filters.minScore !== null) {
      result = result.filter((s) => s.finalScore >= filters.minScore!);
    }
    if (filters.maxScore !== null) {
      result = result.filter((s) => s.finalScore <= filters.maxScore!);
    }
    if (filters.reachedGoal !== 'all') {
      result = result.filter((s) => s.reachedGoal === (filters.reachedGoal === 'true'));
    }
    if (filters.minDuration !== null) {
      result = result.filter((s) => s.duration >= filters.minDuration!);
    }
    if (filters.minEfficiency !== null) {
      result = result.filter((s) => s.pathEfficiency * 100 >= filters.minEfficiency!);
    }

    // Sort
    result.sort((a, b) => {
      const aVal = a[filters.sortBy];
      const bVal = b[filters.sortBy];
      if (aVal instanceof Date && bVal instanceof Date) {
        return filters.sortOrder === 'asc' ? aVal.getTime() - bVal.getTime() : bVal.getTime() - aVal.getTime();
      }
      if (typeof aVal === 'boolean') {
        return filters.sortOrder === 'asc' ? (aVal ? 1 : -1) : (aVal ? -1 : 1);
      }
      const numA = Number(aVal);
      const numB = Number(bVal);
      return filters.sortOrder === 'asc' ? numA - numB : numB - numA;
    });

    return result;
  }, [sessions, filters]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  const handleSort = (key: keyof Session) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: key,
      sortOrder: prev.sortBy === key && prev.sortOrder === 'desc' ? 'asc' : 'desc',
    }));
  };

  const SortIcon = ({ field }: { field: keyof Session }) => {
    if (filters.sortBy !== field) return <ChevronDown size={12} className="opacity-30" />;
    return filters.sortOrder === 'desc' ? (
      <ChevronDown size={12} className="text-[#6366f1]" />
    ) : (
      <ChevronUp size={12} className="text-[#6366f1]" />
    );
  };

  const activeFilterCount = [
    filters.playerName,
    filters.minScore !== null,
    filters.maxScore !== null,
    filters.reachedGoal !== 'all',
    filters.minDuration !== null,
    filters.minEfficiency !== null,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h2 className="text-xl font-bold text-white">Sessions</h2>
        <p className="text-sm text-[#64748b] mt-1">
          All game sessions with detailed analytics
        </p>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between"
      >
        <div className="flex gap-3 flex-1 w-full sm:w-auto">
          {/* Search */}
          <div className="flex items-center gap-2 bg-[#1a1a24]/80 border border-[#2a2a3d]/50 rounded-xl px-3 py-2 flex-1 max-w-sm focus-within:border-[#6366f1]/40">
            <Search size={14} className="text-[#64748b]" />
            <input
              type="text"
              value={filters.playerName}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, playerName: e.target.value }));
                setPage(0);
              }}
              placeholder="Search by player name..."
              className="bg-transparent border-none outline-none text-sm text-[#f1f5f9] placeholder-[#64748b] w-full"
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
              showFilters || activeFilterCount > 0
                ? 'bg-[#6366f1]/20 text-[#6366f1] border-[#6366f1]/30'
                : 'bg-[#1a1a24]/50 text-[#64748b] border-[#2a2a3d]/50 hover:text-[#94a3b8]'
            }`}
          >
            <Filter size={14} />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#6366f1] text-white text-[10px] flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => exportSessionsToCSV(filtered)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-[#1a1a24]/50 text-[#64748b] border border-[#2a2a3d]/50 hover:text-[#94a3b8] transition-all"
          >
            <Download size={14} />
            Export CSV
          </button>
          <span className="px-3 py-2 text-xs text-[#64748b]">
            {filtered.length} sessions
          </span>
        </div>
      </motion.div>

      {/* Filter panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-[10px] uppercase text-[#64748b] font-medium">Min Score</label>
                <input
                  type="number"
                  value={filters.minScore ?? ''}
                  onChange={(e) => setFilters((p) => ({ ...p, minScore: e.target.value ? Number(e.target.value) : null }))}
                  placeholder="0"
                  className="input-dark w-full mt-1"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase text-[#64748b] font-medium">Max Score</label>
                <input
                  type="number"
                  value={filters.maxScore ?? ''}
                  onChange={(e) => setFilters((p) => ({ ...p, maxScore: e.target.value ? Number(e.target.value) : null }))}
                  placeholder="∞"
                  className="input-dark w-full mt-1"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase text-[#64748b] font-medium">Reached Goal</label>
                <select
                  value={filters.reachedGoal}
                  onChange={(e) => setFilters((p) => ({ ...p, reachedGoal: e.target.value as any }))}
                  className="input-dark w-full mt-1"
                >
                  <option value="all">All</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase text-[#64748b] font-medium">Min Efficiency %</label>
                <input
                  type="number"
                  value={filters.minEfficiency ?? ''}
                  onChange={(e) => setFilters((p) => ({ ...p, minEfficiency: e.target.value ? Number(e.target.value) : null }))}
                  placeholder="0"
                  className="input-dark w-full mt-1"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                <button
                  onClick={() => { setFilters(defaultFilters); setPage(0); }}
                  className="text-xs text-[#f43f5e] hover:text-[#f43f5e]/80 transition-colors flex items-center gap-1"
                >
                  <X size={12} /> Clear all filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-[#2a2a3d]/50">
                {[
                  { key: 'playerName' as keyof Session, label: 'Player' },
                  { key: 'finalScore' as keyof Session, label: 'Score' },
                  { key: 'duration' as keyof Session, label: 'Duration' },
                  { key: 'collisions' as keyof Session, label: 'Collisions' },
                  { key: 'wrongTurns' as keyof Session, label: 'Wrong Turns' },
                  { key: 'pathEfficiency' as keyof Session, label: 'Efficiency' },
                  { key: 'averageDecisionTime' as keyof Session, label: 'Decision Time' },
                  { key: 'reachedGoal' as keyof Session, label: 'Goal' },
                  { key: 'startTime' as keyof Session, label: 'Date' },
                ].map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="text-left text-[10px] uppercase tracking-wider text-[#64748b] font-medium px-4 py-4 cursor-pointer hover:text-[#94a3b8] transition-colors select-none"
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      <SortIcon field={col.key} />
                    </div>
                  </th>
                ))}
                <th className="px-4 py-4 w-10" />
              </tr>
            </thead>
            <tbody>
              {paginated.map((session, i) => (
                <motion.tr
                  key={session.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-[#2a2a3d]/20 table-row-hover cursor-pointer"
                  onClick={() => setSelectedSession(session)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6366f1]/15 to-[#8b5cf6]/15 border border-[#6366f1]/15 flex items-center justify-center text-[10px] font-bold text-[#6366f1]">
                        {session.playerName[0]?.toUpperCase()}
                      </div>
                      <span className="text-sm text-white font-medium">{session.playerName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-[#f59e0b] font-mono">
                    {session.finalScore.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#94a3b8] font-mono">
                    {formatDuration(session.duration)}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#94a3b8]">{session.collisions}</td>
                  <td className="px-4 py-3 text-sm text-[#94a3b8]">{session.wrongTurns}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${
                      session.pathEfficiency > 0.5 ? 'text-[#10b981]' : session.pathEfficiency > 0.2 ? 'text-[#f59e0b]' : 'text-[#f43f5e]'
                    }`}>
                      {(session.pathEfficiency * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#94a3b8] font-mono">
                    {session.averageDecisionTime.toFixed(3)}s
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${session.reachedGoal ? 'badge-success' : 'badge-danger'}`}>
                      {session.reachedGoal ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#64748b] font-mono">
                    {format(session.startTime, 'MMM dd, HH:mm')}
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-[#64748b] hover:text-[#6366f1] transition-colors">
                      <Eye size={14} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#2a2a3d]/50">
            <p className="text-xs text-[#64748b]">
              Showing {page * ITEMS_PER_PAGE + 1}–{Math.min((page + 1) * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="p-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3d]/50 text-[#94a3b8] disabled:opacity-30 hover:bg-[#1e1e2e] transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                const pageNum = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
                if (pageNum >= totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                      page === pageNum
                        ? 'bg-[#6366f1] text-white'
                        : 'bg-[#1a1a24] border border-[#2a2a3d]/50 text-[#94a3b8] hover:bg-[#1e1e2e]'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3d]/50 text-[#94a3b8] disabled:opacity-30 hover:bg-[#1e1e2e] transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Session Detail Modal */}
      <AnimatePresence>
        {selectedSession && (
          <SessionDetailModal
            session={selectedSession}
            globalMetrics={globalMetrics}
            onClose={() => setSelectedSession(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
