'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Session, PlayerMetrics, TrendData, GlobalMetrics } from '@/types';
import PlayerComparisonChart from '@/charts/PlayerComparisonChart';
import ScoreVsCollisionsChart from '@/charts/ScoreVsCollisionsChart';
import SuccessRateChart from '@/charts/SuccessRateChart';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
} from 'recharts';

interface AnalyticsSectionProps {
  sessions: Session[];
  players: PlayerMetrics[];
  metrics: GlobalMetrics;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-[#13131d] border border-[#2a2a3d] rounded-xl p-3 shadow-2xl">
      <p className="text-xs text-white font-medium mb-1">{data.name}</p>
      <div className="space-y-0.5 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-[#64748b]">Efficiency:</span>
          <span className="text-[#10b981]">{data.x.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-[#64748b]">Duration:</span>
          <span className="text-[#06b6d4]">{data.y.toFixed(1)}s</span>
        </div>
      </div>
    </div>
  );
};

export default function AnalyticsSection({ sessions, players, metrics }: AnalyticsSectionProps) {
  // Efficiency vs Duration scatter data
  const effVsDuration = sessions.map((s) => ({
    x: s.pathEfficiency * 100,
    y: s.duration,
    name: s.playerName,
    z: s.finalScore,
  }));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h2 className="text-xl font-bold text-white">Analytics</h2>
        <p className="text-sm text-[#64748b] mt-1">
          Deep gameplay analysis and player comparisons
        </p>
      </motion.div>

      {/* Row 1: Bar charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlayerComparisonChart
          players={players}
          metric="avgCollisions"
          title="Collisions per Player"
          subtitle="Average collisions across all sessions"
          color="#f43f5e"
        />
        <PlayerComparisonChart
          players={players}
          metric="avgWrongTurns"
          title="Wrong Turns per Player"
          subtitle="Average wrong turns across all sessions"
          color="#a855f7"
        />
      </div>

      {/* Row 2: Scatter + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-white">Efficiency vs Duration</h3>
              <p className="text-xs text-[#64748b] mt-0.5">How efficiency correlates with time spent</p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3d30" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Efficiency"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={{ stroke: '#2a2a3d30' }}
                  tickLine={false}
                  unit="%"
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Duration"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  unit="s"
                />
                <ZAxis type="number" dataKey="z" range={[40, 200]} />
                <Tooltip content={<CustomTooltip />} />
                <Scatter data={effVsDuration} fill="#06b6d4" fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
        <SuccessRateChart sessions={sessions} />
      </div>

      {/* Row 3: More bar charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlayerComparisonChart
          players={players}
          metric="avgScore"
          title="Average Score per Player"
          subtitle="Mean score across all sessions"
          color="#f59e0b"
        />
        <PlayerComparisonChart
          players={players}
          metric="avgEfficiency"
          title="Efficiency per Player"
          subtitle="Average path efficiency percentage"
          color="#10b981"
        />
      </div>

      {/* Score vs Collisions */}
      <ScoreVsCollisionsChart sessions={sessions} />
    </div>
  );
}
