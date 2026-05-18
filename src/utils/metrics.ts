// ============================================================
// UTILITY FUNCTIONS - Metrics Calculations
// ============================================================

import { Session, GlobalMetrics, PlayerMetrics, TrendData, HeatmapCell, InsightData } from '@/types';
import { format, subDays, isAfter, parseISO } from 'date-fns';

// --- Global Metrics Calculation ---

export function calculateGlobalMetrics(sessions: Session[]): GlobalMetrics {
  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      uniquePlayers: 0,
      averageScore: 0,
      maxScore: 0,
      successRate: 0,
      avgDuration: 0,
      totalCollisions: 0,
      totalPauses: 0,
      avgDecisionTime: 0,
      avgEfficiency: 0,
      avgWrongTurns: 0,
      avgRemainingTime: 0,
    };
  }

  const uniquePlayerNames = new Set(sessions.map((s) => s.playerName));
  const totalScore = sessions.reduce((sum, s) => sum + s.finalScore, 0);
  const maxScore = Math.max(...sessions.map((s) => s.finalScore));
  const successCount = sessions.filter((s) => s.reachedGoal).length;
  const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
  const totalCollisions = sessions.reduce((sum, s) => sum + s.collisions, 0);
  const totalPauses = sessions.reduce((sum, s) => sum + s.pauseCount, 0);
  const totalDecisionTime = sessions.reduce((sum, s) => sum + s.averageDecisionTime, 0);
  const totalEfficiency = sessions.reduce((sum, s) => sum + s.pathEfficiency, 0);
  const totalWrongTurns = sessions.reduce((sum, s) => sum + s.wrongTurns, 0);
  const totalRemainingTime = sessions.reduce((sum, s) => sum + s.remainingTime, 0);

  return {
    totalSessions: sessions.length,
    uniquePlayers: uniquePlayerNames.size,
    averageScore: Math.round(totalScore / sessions.length),
    maxScore,
    successRate: (successCount / sessions.length) * 100,
    avgDuration: totalDuration / sessions.length,
    totalCollisions,
    totalPauses,
    avgDecisionTime: totalDecisionTime / sessions.length,
    avgEfficiency: (totalEfficiency / sessions.length) * 100,
    avgWrongTurns: totalWrongTurns / sessions.length,
    avgRemainingTime: totalRemainingTime / sessions.length,
  };
}

// --- Player Metrics ---

export function calculatePlayerMetrics(sessions: Session[]): PlayerMetrics[] {
  const playerMap = new Map<string, Session[]>();

  sessions.forEach((session) => {
    const existing = playerMap.get(session.playerName) || [];
    existing.push(session);
    playerMap.set(session.playerName, existing);
  });

  return Array.from(playerMap.entries()).map(([name, playerSessions]) => {
    const totalScore = playerSessions.reduce((sum, s) => sum + s.finalScore, 0);
    const bestScore = Math.max(...playerSessions.map((s) => s.finalScore));
    const totalDuration = playerSessions.reduce((sum, s) => sum + s.duration, 0);
    const successCount = playerSessions.filter((s) => s.reachedGoal).length;

    return {
      playerName: name,
      totalSessions: playerSessions.length,
      bestScore,
      avgScore: Math.round(totalScore / playerSessions.length),
      avgDuration: totalDuration / playerSessions.length,
      avgCollisions: playerSessions.reduce((sum, s) => sum + s.collisions, 0) / playerSessions.length,
      avgWrongTurns: playerSessions.reduce((sum, s) => sum + s.wrongTurns, 0) / playerSessions.length,
      avgEfficiency: (playerSessions.reduce((sum, s) => sum + s.pathEfficiency, 0) / playerSessions.length) * 100,
      avgDecisionTime: playerSessions.reduce((sum, s) => sum + s.averageDecisionTime, 0) / playerSessions.length,
      successRate: (successCount / playerSessions.length) * 100,
      totalPlaytime: totalDuration,
      sessions: playerSessions,
    };
  }).sort((a, b) => b.bestScore - a.bestScore);
}

// --- Trend Data ---

export function calculateTrends(sessions: Session[], days: number = 30): TrendData[] {
  const now = new Date();
  const trends: TrendData[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(now, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const daySessions = sessions.filter(
      (s) => format(s.startTime, 'yyyy-MM-dd') === dateStr
    );

    if (daySessions.length > 0) {
      const avgScore = daySessions.reduce((sum, s) => sum + s.finalScore, 0) / daySessions.length;
      const avgDuration = daySessions.reduce((sum, s) => sum + s.duration, 0) / daySessions.length;
      const avgEfficiency = (daySessions.reduce((sum, s) => sum + s.pathEfficiency, 0) / daySessions.length) * 100;
      const successRate = (daySessions.filter((s) => s.reachedGoal).length / daySessions.length) * 100;

      trends.push({
        date: format(date, 'MMM dd'),
        sessions: daySessions.length,
        avgScore: Math.round(avgScore),
        avgDuration: Math.round(avgDuration * 10) / 10,
        avgEfficiency: Math.round(avgEfficiency * 10) / 10,
        successRate: Math.round(successRate * 10) / 10,
      });
    } else {
      trends.push({
        date: format(date, 'MMM dd'),
        sessions: 0,
        avgScore: 0,
        avgDuration: 0,
        avgEfficiency: 0,
        successRate: 0,
      });
    }
  }

  return trends;
}

// --- Heatmap Data ---

export function calculateHeatmap(sessions: Session[]): HeatmapCell[] {
  const heatmap: HeatmapCell[] = [];
  const counts: Record<string, number> = {};

  sessions.forEach((s) => {
    const day = s.startTime.getDay();
    const hour = s.startTime.getHours();
    const key = `${day}-${hour}`;
    counts[key] = (counts[key] || 0) + 1;
  });

  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const key = `${day}-${hour}`;
      heatmap.push({ day, hour, value: counts[key] || 0 });
    }
  }

  return heatmap;
}

// --- Session Insights ---

export function generateSessionInsights(session: Session, globalMetrics: GlobalMetrics): InsightData[] {
  const insights: InsightData[] = [];

  // Score analysis
  if (session.finalScore > globalMetrics.averageScore * 1.5) {
    insights.push({
      type: 'positive',
      title: 'Outstanding Score',
      description: `Score ${session.finalScore} is ${Math.round(((session.finalScore / globalMetrics.averageScore) - 1) * 100)}% above average`,
      icon: '🏆',
    });
  } else if (session.finalScore < globalMetrics.averageScore * 0.5) {
    insights.push({
      type: 'negative',
      title: 'Below Average Score',
      description: `Score ${session.finalScore} is significantly below the average of ${globalMetrics.averageScore}`,
      icon: '📉',
    });
  }

  // Collision analysis
  const avgCollisions = globalMetrics.totalCollisions / globalMetrics.totalSessions;
  if (session.collisions > avgCollisions * 1.5) {
    insights.push({
      type: 'warning',
      title: 'High Collision Rate',
      description: `${session.collisions} collisions — ${Math.round(((session.collisions / avgCollisions) - 1) * 100)}% above average`,
      icon: '💥',
    });
  } else if (session.collisions < avgCollisions * 0.5) {
    insights.push({
      type: 'positive',
      title: 'Excellent Navigation',
      description: `Only ${session.collisions} collisions — well below the average of ${Math.round(avgCollisions)}`,
      icon: '🎯',
    });
  }

  // Efficiency analysis
  const avgEff = globalMetrics.avgEfficiency / 100;
  if (session.pathEfficiency > avgEff * 1.3) {
    insights.push({
      type: 'positive',
      title: 'High Path Efficiency',
      description: `${(session.pathEfficiency * 100).toFixed(1)}% efficiency — excellent route optimization`,
      icon: '⚡',
    });
  }

  // Decision time
  if (session.averageDecisionTime < globalMetrics.avgDecisionTime * 0.7) {
    insights.push({
      type: 'positive',
      title: 'Fast Decision Making',
      description: `${session.averageDecisionTime.toFixed(3)}s avg decision time — quick reflexes`,
      icon: '🧠',
    });
  } else if (session.averageDecisionTime > globalMetrics.avgDecisionTime * 1.5) {
    insights.push({
      type: 'neutral',
      title: 'Careful Decision Making',
      description: `${session.averageDecisionTime.toFixed(3)}s avg — takes time to evaluate options`,
      icon: '🤔',
    });
  }

  // Goal reached
  if (session.reachedGoal) {
    insights.push({
      type: 'positive',
      title: 'Goal Reached',
      description: `Successfully completed the maze with ${session.remainingTime.toFixed(1)}s remaining`,
      icon: '✅',
    });
  } else {
    insights.push({
      type: 'negative',
      title: 'Goal Not Reached',
      description: 'Player did not complete the maze in this session',
      icon: '❌',
    });
  }

  // Wrong turns
  const avgWrongTurns = globalMetrics.avgWrongTurns;
  if (session.wrongTurns > avgWrongTurns * 1.5) {
    insights.push({
      type: 'warning',
      title: 'Many Wrong Turns',
      description: `${session.wrongTurns} wrong turns — may need better spatial awareness`,
      icon: '🔄',
    });
  }

  return insights;
}

// --- Formatting Utilities ---

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatDecimal(value: number, places: number = 2): string {
  return value.toFixed(places);
}

export function getScoreColor(score: number, maxScore: number): string {
  const ratio = score / maxScore;
  if (ratio > 0.8) return '#10b981';
  if (ratio > 0.5) return '#f59e0b';
  if (ratio > 0.3) return '#f97316';
  return '#ef4444';
}

export function getEfficiencyColor(efficiency: number): string {
  if (efficiency > 70) return '#10b981';
  if (efficiency > 40) return '#f59e0b';
  return '#ef4444';
}

// --- CSV Export ---

export function exportSessionsToCSV(sessions: Session[]): void {
  const headers = [
    'Player Name',
    'Final Score',
    'Duration (s)',
    'Collisions',
    'Wrong Turns',
    'Pause Count',
    'Path Efficiency',
    'Decision Time (s)',
    'Reached Goal',
    'Remaining Time (s)',
    'Start Time',
  ];

  const rows = sessions.map((s) => [
    s.playerName,
    s.finalScore,
    s.duration.toFixed(2),
    s.collisions,
    s.wrongTurns,
    s.pauseCount,
    (s.pathEfficiency * 100).toFixed(2),
    s.averageDecisionTime.toFixed(4),
    s.reachedGoal ? 'Yes' : 'No',
    s.remainingTime.toFixed(2),
    format(s.startTime, 'yyyy-MM-dd HH:mm:ss'),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((r) => r.join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `maze-sessions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

// --- Date Filter ---

export function filterSessionsByDateRange(sessions: Session[], range: string): Session[] {
  if (range === 'all') return sessions;

  const days = parseInt(range);
  const cutoff = subDays(new Date(), days);

  return sessions.filter((s) => isAfter(s.startTime, cutoff));
}
