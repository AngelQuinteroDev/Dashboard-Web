'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendData, Session, GlobalMetrics } from '@/types';
import ScoreEvolutionChart from '@/charts/ScoreEvolutionChart';
import SessionActivityChart from '@/charts/SessionActivityChart';
import EfficiencyTrendChart from '@/charts/EfficiencyTrendChart';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface TrendsSectionProps {
  trends: TrendData[];
  sessions: Session[];
  metrics: GlobalMetrics;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#13131d] border border-[#2a2a3d] rounded-xl p-3 shadow-2xl">
      <p className="text-xs text-[#64748b] mb-2">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-[#94a3b8]">{entry.name}:</span>
          <span className="text-white font-medium">{typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function TrendsSection({ trends, sessions, metrics }: TrendsSectionProps) {
  // Duration trend data
  const durationTrend = trends.map((t) => ({
    ...t,
    avgDuration: t.avgDuration,
  }));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h2 className="text-xl font-bold text-white">Trends</h2>
        <p className="text-sm text-[#64748b] mt-1">
          Temporal patterns and evolution metrics
        </p>
      </motion.div>

      {/* Score & Session Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScoreEvolutionChart data={trends} />
        <SessionActivityChart data={trends} />
      </div>

      {/* Efficiency & Success Trends */}
      <EfficiencyTrendChart data={trends} />

      {/* Duration Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-white">Duration Trend</h3>
          <p className="text-xs text-[#64748b] mt-0.5">Average session duration over time</p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={durationTrend} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="durationGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3d30" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={{ stroke: '#2a2a3d30' }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              unit="s"
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="avgDuration"
              name="Avg Duration (s)"
              stroke="#f97316"
              strokeWidth={2}
              fill="url(#durationGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#f97316', stroke: '#0a0a0f', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Trend Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <h3 className="text-sm font-semibold text-white mb-4">Trend Insights</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(() => {
            const activeDays = trends.filter((t) => t.sessions > 0);
            const recentWeek = activeDays.slice(-7);
            const prevWeek = activeDays.slice(-14, -7);

            const recentAvgScore = recentWeek.length > 0
              ? recentWeek.reduce((s, t) => s + t.avgScore, 0) / recentWeek.length
              : 0;
            const prevAvgScore = prevWeek.length > 0
              ? prevWeek.reduce((s, t) => s + t.avgScore, 0) / prevWeek.length
              : 0;

            const recentSessions = recentWeek.reduce((s, t) => s + t.sessions, 0);
            const prevSessions = prevWeek.reduce((s, t) => s + t.sessions, 0);

            const insights = [
              {
                label: 'Active Days',
                value: `${activeDays.length}/${trends.length}`,
                description: 'Days with at least 1 session',
              },
              {
                label: 'Peak Day',
                value: activeDays.length > 0
                  ? activeDays.reduce((a, b) => (a.sessions > b.sessions ? a : b)).date
                  : 'N/A',
                description: `${activeDays.length > 0 ? activeDays.reduce((a, b) => (a.sessions > b.sessions ? a : b)).sessions : 0} sessions`,
              },
              {
                label: 'Avg Score Trend',
                value: prevAvgScore > 0
                  ? `${recentAvgScore > prevAvgScore ? '↑' : '↓'} ${Math.abs(((recentAvgScore - prevAvgScore) / prevAvgScore) * 100).toFixed(1)}%`
                  : 'N/A',
                description: 'This week vs last week',
              },
              {
                label: 'Activity Trend',
                value: prevSessions > 0
                  ? `${recentSessions > prevSessions ? '↑' : '↓'} ${Math.abs(((recentSessions - prevSessions) / prevSessions) * 100).toFixed(1)}%`
                  : 'N/A',
                description: 'Session count change',
              },
            ];

            return insights.map((ins, i) => (
              <div key={ins.label} className="bg-[#1a1a24]/60 border border-[#2a2a3d]/30 rounded-xl p-4">
                <p className="text-[10px] uppercase text-[#64748b] tracking-wider mb-2">{ins.label}</p>
                <p className="text-lg font-bold text-white">{ins.value}</p>
                <p className="text-[10px] text-[#4a5568] mt-0.5">{ins.description}</p>
              </div>
            ));
          })()}
        </div>
      </motion.div>
    </div>
  );
}
