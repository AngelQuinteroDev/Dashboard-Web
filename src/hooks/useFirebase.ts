// ============================================================
// CUSTOM HOOKS - Firebase real-time data hooks
// ============================================================

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { subscribeSessions, subscribeHighscores } from '@/firebase/services';
import { Session, Highscore, GlobalMetrics, PlayerMetrics, SessionFilters } from '@/types';
import {
  calculateGlobalMetrics,
  calculatePlayerMetrics,
  calculateTrends,
  calculateHeatmap,
  filterSessionsByDateRange,
} from '@/utils/metrics';

// --- Sessions Hook ---

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeSessions(
      (data) => {
        setSessions(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { sessions, loading, error };
}

// --- Highscores Hook ---

export function useHighscores() {
  const [highscores, setHighscores] = useState<Highscore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeHighscores(
      (data) => {
        setHighscores(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { highscores, loading, error };
}

// --- Global Metrics Hook ---

export function useGlobalMetrics(sessions: Session[]) {
  return useMemo(() => calculateGlobalMetrics(sessions), [sessions]);
}

// --- Player Metrics Hook ---

export function usePlayerMetrics(sessions: Session[]) {
  return useMemo(() => calculatePlayerMetrics(sessions), [sessions]);
}

// --- Trends Hook ---

export function useTrends(sessions: Session[], days: number = 30) {
  return useMemo(() => calculateTrends(sessions, days), [sessions, days]);
}

// --- Heatmap Hook ---

export function useHeatmap(sessions: Session[]) {
  return useMemo(() => calculateHeatmap(sessions), [sessions]);
}

// --- Filtered Sessions Hook ---

export function useFilteredSessions(sessions: Session[], filters: SessionFilters) {
  return useMemo(() => {
    let filtered = [...sessions];

    // Date range filter
    if (filters.dateRange !== 'all') {
      const days = parseInt(filters.dateRange);
      filtered = filterSessionsByDateRange(filtered, filters.dateRange);
    }

    // Player name filter
    if (filters.playerName) {
      filtered = filtered.filter((s) =>
        s.playerName.toLowerCase().includes(filters.playerName.toLowerCase())
      );
    }

    // Score filters
    if (filters.minScore !== null) {
      filtered = filtered.filter((s) => s.finalScore >= filters.minScore!);
    }
    if (filters.maxScore !== null) {
      filtered = filtered.filter((s) => s.finalScore <= filters.maxScore!);
    }

    // ReachedGoal filter
    if (filters.reachedGoal !== 'all') {
      filtered = filtered.filter(
        (s) => s.reachedGoal === (filters.reachedGoal === 'true')
      );
    }

    // Duration filters
    if (filters.minDuration !== null) {
      filtered = filtered.filter((s) => s.duration >= filters.minDuration!);
    }
    if (filters.maxDuration !== null) {
      filtered = filtered.filter((s) => s.duration <= filters.maxDuration!);
    }

    // Efficiency filter
    if (filters.minEfficiency !== null) {
      filtered = filtered.filter(
        (s) => s.pathEfficiency * 100 >= filters.minEfficiency!
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      const aVal = a[filters.sortBy];
      const bVal = b[filters.sortBy];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return filters.sortOrder === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      if (aVal instanceof Date && bVal instanceof Date) {
        return filters.sortOrder === 'asc'
          ? aVal.getTime() - bVal.getTime()
          : bVal.getTime() - aVal.getTime();
      }

      const numA = Number(aVal);
      const numB = Number(bVal);
      return filters.sortOrder === 'asc' ? numA - numB : numB - numA;
    });

    return filtered;
  }, [sessions, filters]);
}

// --- Search Hook ---

export function usePlayerSearch(sessions: Session[]) {
  const [searchTerm, setSearchTerm] = useState('');

  const results = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const uniquePlayers = [...new Set(sessions.map((s) => s.playerName))];
    return uniquePlayers.filter((name) =>
      name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sessions, searchTerm]);

  return { searchTerm, setSearchTerm, results };
}

// --- Connection Status Hook ---

export function useFirestoreConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeSessions(
      () => {
        setIsConnected(true);
        setLastUpdate(new Date());
      },
      () => {
        setIsConnected(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { isConnected, lastUpdate };
}
