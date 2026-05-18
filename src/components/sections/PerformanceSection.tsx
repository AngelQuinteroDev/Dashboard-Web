'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Gauge, Brain, Route, Timer, AlertTriangle, RotateCcw, Zap } from 'lucide-react';
import { Session, GlobalMetrics, PlayerMetrics } from '@/types';
import { formatDecimal, formatPercentage } from '@/utils/metrics';
import MetricCard from '@/components/MetricCard';

interface PerformanceSectionProps {
  sessions: Session[];
  metrics: GlobalMetrics;
  players: PlayerMetrics[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#13131d] border border-[#2a2a3d] rounded-xl p-3 shadow-2xl">
      <p className="text-xs text-[#64748b] mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full" style={{ background: entry.fill || entry.color }} />
          <span className="text-white font-medium">{typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function PerformanceSection({ sessions, metrics, players }: PerformanceSectionProps) {
  // Gauge-style metric data
  const performanceMetrics = [
    {
      label: 'Avg Decision Time',
      value: metrics.avgDecisionTime,
      unit: 's',
      max: 1,
      color: '#14b8a6',
      icon: <Brain size={18} />,
      description: 'Lower is better',
    },
    {
      label: 'Avg Path Efficiency',
      value: metrics.avgEfficiency,
      unit: '%',
      max: 100,
      color: '#10b981',
      icon: <Route size={18} />,
      description: 'Higher is better',
    },
    {
      label: 'Avg Wrong Turns',
      value: metrics.avgWrongTurns,
      unit: '',
      max: 100,
      color: '#a855f7',
      icon: <RotateCcw size={18} />,
      description: 'Lower is better',
    },
    {
      label: 'Success Rate',
      value: metrics.successRate,
      unit: '%',
      max: 100,
      color: '#10b981',
      icon: <Zap size={18} />,
      description: 'Higher is better',
    },
  ];

  // Score distribution data
  const scoreRanges = [
    { range: '0-2K', min: 0, max: 2000 },
    { range: '2K-4K', min: 2000, max: 4000 },
    { range: '4K-6K', min: 4000, max: 6000 },
    { range: '6K-8K', min: 6000, max: 8000 },
    { range: '8K-10K', min: 8000, max: 10000 },
    { range: '10K+', min: 10000, max: Infinity },
  ];

  const scoreDistribution = scoreRanges.map((range) => ({
    name: range.range,
    count: sessions.filter((s) => s.finalScore >= range.min && s.finalScore < range.max).length,
  }));

  const distributionColors = ['#f43f5e', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#6366f1'];

  // Duration distribution
  const durationRanges = [
    { range: '0-15s', min: 0, max: 15 },
    { range: '15-30s', min: 15, max: 30 },
    { range: '30-60s', min: 30, max: 60 },
    { range: '60-90s', min: 60, max: 90 },
    { range: '90-120s', min: 90, max: 120 },
  ];

  const durationDistribution = durationRanges.map((range) => ({
    name: range.range,
    count: sessions.filter((s) => s.duration >= range.min && s.duration < range.max).length,
  }));

  // Top performers
  const topByScore = [...sessions].sort((a, b) => b.finalScore - a.finalScore).slice(0, 5);
  const topByEfficiency = [...sessions]
    .filter((s) => s.reachedGoal)
    .sort((a, b) => b.pathEfficiency - a.pathEfficiency)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h2 className="text-xl font-bold text-white">Performance</h2>
        <p className="text-sm text-[#64748b] mt-1">
          Game performance metrics and distributions
        </p>
      </motion.div>

      {/* Gauge Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <span style={{ color: m.color }}>{m.icon}</span>
              <span className="text-[10px] uppercase text-[#64748b] tracking-wider font-medium">{m.label}</span>
            </div>

            {/* Gauge bar */}
            <div className="relative mb-3">
              <div className="w-full h-3 bg-[#1a1a24] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((m.value / m.max) * 100, 100)}%` }}
                  transition={{ duration: 1, delay: i * 0.1 + 0.3 }}
                  className="h-full rounded-full"
                  style={{ background: m.color }}
                />
              </div>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white">
                {m.value.toFixed(m.unit === 's' ? 3 : 1)}
              </span>
              <span className="text-sm text-[#64748b]">{m.unit}</span>
            </div>
            <p className="text-[10px] text-[#4a5568] mt-1">{m.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-white">Score Distribution</h3>
            <p className="text-xs text-[#64748b] mt-0.5">Sessions grouped by score range</p>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={scoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3d30" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#2a2a3d30' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {scoreDistribution.map((_, index) => (
                  <Cell key={index} fill={distributionColors[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Duration Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-6"
        >
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-white">Duration Distribution</h3>
            <p className="text-xs text-[#64748b] mt-0.5">Sessions grouped by duration range</p>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={durationDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3d30" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#2a2a3d30' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} />
              <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h3 className="text-sm font-semibold text-white mb-4">🏆 Top Scores (All-Time)</h3>
          <div className="space-y-2">
            {topByScore.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-[#1a1a24]/40">
                <span className="text-xs font-bold text-[#64748b] w-6">#{i + 1}</span>
                <span className="text-sm text-white flex-1">{s.playerName}</span>
                <span className="text-sm font-bold text-[#f59e0b] font-mono">{s.finalScore.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass-card p-6"
        >
          <h3 className="text-sm font-semibold text-white mb-4">⚡ Top Efficiency (Goal Reached)</h3>
          <div className="space-y-2">
            {topByEfficiency.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-[#1a1a24]/40">
                <span className="text-xs font-bold text-[#64748b] w-6">#{i + 1}</span>
                <span className="text-sm text-white flex-1">{s.playerName}</span>
                <span className="text-sm font-bold text-[#10b981] font-mono">{(s.pathEfficiency * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
