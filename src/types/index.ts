

import { Timestamp } from 'firebase/firestore';


export interface SessionDocument {
  averageDecisionTime: number;
  collisions: number;
  duration: number;
  finalScore: number;
  pathEfficiency: number;
  pauseCount: number;
  playerName: string;
  reachedGoal: boolean;
  remainingTime: number;
  sessionId: string;
  startTime: Timestamp;
  wrongTurns: number;
}

export interface Session extends Omit<SessionDocument, 'startTime'> {
  id: string;
  startTime: Date;
}

export interface HighscoreDocument {
  playerName: string;
  score: number;
}

export interface Highscore extends HighscoreDocument {
  id: string;
  rank?: number;
}



export interface GlobalMetrics {
  totalSessions: number;
  uniquePlayers: number;
  averageScore: number;
  maxScore: number;
  successRate: number;
  avgDuration: number;
  totalCollisions: number;
  totalPauses: number;
  avgDecisionTime: number;
  avgEfficiency: number;
  avgWrongTurns: number;
  avgRemainingTime: number;
}

export interface PlayerMetrics {
  playerName: string;
  totalSessions: number;
  bestScore: number;
  avgScore: number;
  avgDuration: number;
  avgCollisions: number;
  avgWrongTurns: number;
  avgEfficiency: number;
  avgDecisionTime: number;
  successRate: number;
  totalPlaytime: number;
  sessions: Session[];
}

export interface TrendData {
  date: string;
  sessions: number;
  avgScore: number;
  avgDuration: number;
  avgEfficiency: number;
  successRate: number;
}

export interface HeatmapCell {
  day: number;
  hour: number;
  value: number;
}



export interface SessionFilters {
  playerName: string;
  minScore: number | null;
  maxScore: number | null;
  reachedGoal: 'all' | 'true' | 'false';
  minDuration: number | null;
  maxDuration: number | null;
  minEfficiency: number | null;
  sortBy: keyof Session;
  sortOrder: 'asc' | 'desc';
  dateRange: 'all' | '7d' | '30d' | '90d';
}



export type SidebarSection = 
  | 'overview'
  | 'leaderboard'
  | 'sessions'
  | 'players'
  | 'analytics'
  | 'performance'
  | 'heatmaps'
  | 'trends'
  | 'settings';

export interface MetricCardData {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  color: string;
  sparklineData?: number[];
}

export interface InsightData {
  type: 'positive' | 'negative' | 'neutral' | 'warning';
  title: string;
  description: string;
  icon: string;
}



export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface RadarDataPoint {
  subject: string;
  value: number;
  fullMark: number;
}

export interface ScatterDataPoint {
  x: number;
  y: number;
  name: string;
  z?: number;
}
