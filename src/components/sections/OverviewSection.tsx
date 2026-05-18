'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Gamepad2,
  Users,
  Target,
  Trophy,
  Clock,
  Zap,
  AlertTriangle,
  Pause,
  Brain,
  Route,
  RotateCcw,
  Timer,
} from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import ScoreEvolutionChart from '@/charts/ScoreEvolutionChart';
import SessionActivityChart from '@/charts/SessionActivityChart';
import SuccessRateChart from '@/charts/SuccessRateChart';
import ScoreVsCollisionsChart from '@/charts/ScoreVsCollisionsChart';
import { Session, GlobalMetrics, TrendData, Highscore } from '@/types';
import { formatDuration, formatNumber, formatPercentage, formatDecimal } from '@/utils/metrics';

interface OverviewSectionProps {
  sessions: Session[];
  metrics: GlobalMetrics;
  trends: TrendData[];
  highscores: Highscore[];
}

export default function OverviewSection({
  sessions,
  metrics,
  trends,
  highscores,
}: OverviewSectionProps) {
  const recentSessions = sessions.slice(0, 5);
  const topPlayers = highscores.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Section Title */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-xl font-bold text-white">Overview</h2>
        <p className="text-sm text-[#64748b] mt-1">
          Global game metrics and performance summary
        </p>
      </motion.div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <MetricCard
          title="Total Sessions"
          value={formatNumber(metrics.totalSessions)}
          icon={<Gamepad2 size={18} />}
          color="#6366f1"
          delay={0}
        />
        <MetricCard
          title="Unique Players"
          value={formatNumber(metrics.uniquePlayers)}
          icon={<Users size={18} />}
          color="#8b5cf6"
          delay={1}
        />
        <MetricCard
          title="Average Score"
          value={formatNumber(metrics.averageScore)}
          icon={<Target size={18} />}
          color="#06b6d4"
          delay={2}
        />
        <MetricCard
          title="Max Score"
          value={formatNumber(metrics.maxScore)}
          icon={<Trophy size={18} />}
          color="#f59e0b"
          delay={3}
        />
        <MetricCard
          title="Success Rate"
          value={formatPercentage(metrics.successRate)}
          icon={<Zap size={18} />}
          color="#10b981"
          delay={4}
        />
        <MetricCard
          title="Avg Duration"
          value={formatDuration(metrics.avgDuration)}
          icon={<Clock size={18} />}
          color="#f97316"
          delay={5}
        />
        <MetricCard
          title="Total Collisions"
          value={formatNumber(metrics.totalCollisions)}
          icon={<AlertTriangle size={18} />}
          color="#f43f5e"
          delay={6}
        />
        <MetricCard
          title="Total Pauses"
          value={formatNumber(metrics.totalPauses)}
          icon={<Pause size={18} />}
          color="#ec4899"
          delay={7}
        />
        <MetricCard
          title="Avg Decision Time"
          value={`${formatDecimal(metrics.avgDecisionTime, 3)}s`}
          icon={<Brain size={18} />}
          color="#14b8a6"
          delay={8}
        />
        <MetricCard
          title="Avg Efficiency"
          value={formatPercentage(metrics.avgEfficiency)}
          icon={<Route size={18} />}
          color="#84cc16"
          delay={9}
        />
        <MetricCard
          title="Avg Wrong Turns"
          value={formatDecimal(metrics.avgWrongTurns, 1)}
          icon={<RotateCcw size={18} />}
          color="#a855f7"
          delay={10}
        />
        <MetricCard
          title="Avg Remaining Time"
          value={`${formatDecimal(metrics.avgRemainingTime, 1)}s`}
          icon={<Timer size={18} />}
          color="#0ea5e9"
          delay={11}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScoreEvolutionChart data={trends} />
        <SessionActivityChart data={trends} />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SuccessRateChart sessions={sessions} />
        <div className="lg:col-span-2">
          <ScoreVsCollisionsChart sessions={sessions} />
        </div>
      </div>

      {/* Recent Activity & Top Players */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="glass-card p-6"
        >
          <h3 className="text-sm font-semibold text-white mb-4">Recent Sessions</h3>
          <div className="space-y-3">
            {recentSessions.map((session, i) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#1a1a24]/50 hover:bg-[#1e1e2e]/50 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366f1]/20 to-[#8b5cf6]/20 border border-[#6366f1]/20 flex items-center justify-center text-xs font-bold text-[#6366f1]">
                  {session.playerName[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">
                    {session.playerName}
                  </p>
                  <p className="text-xs text-[#64748b]">
                    Score: {session.finalScore} · {formatDuration(session.duration)}
                  </p>
                </div>
                <div
                  className={`badge ${session.reachedGoal ? 'badge-success' : 'badge-danger'}`}
                >
                  {session.reachedGoal ? '✓ Goal' : '✗ Failed'}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Top Players */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="glass-card p-6"
        >
          <h3 className="text-sm font-semibold text-white mb-4">Top Players</h3>
          <div className="space-y-3">
            {topPlayers.map((player, i) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#1a1a24]/50 hover:bg-[#1e1e2e]/50 transition-colors"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0
                      ? 'medal-gold'
                      : i === 1
                      ? 'medal-silver'
                      : i === 2
                      ? 'medal-bronze'
                      : 'bg-[#2a2a3d] text-[#94a3b8]'
                  }`}
                >
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white font-medium">{player.playerName}</p>
                </div>
                <p className="text-sm font-bold text-[#f59e0b] font-mono">
                  {formatNumber(player.score)}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
