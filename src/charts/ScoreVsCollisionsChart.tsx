'use client';

import React from 'react';
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
import { motion } from 'framer-motion';
import { Session } from '@/types';

interface ScoreVsCollisionsChartProps {
  sessions: Session[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-[#13131d] border border-[#2a2a3d] rounded-xl p-3 shadow-2xl min-w-[160px]">
      <p className="text-xs text-white font-medium mb-2">{data.name}</p>
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-[#64748b]">Score:</span>
          <span className="text-[#6366f1] font-medium">{data.x}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-[#64748b]">Collisions:</span>
          <span className="text-[#f43f5e] font-medium">{data.y}</span>
        </div>
      </div>
    </div>
  );
};

export default function ScoreVsCollisionsChart({ sessions }: ScoreVsCollisionsChartProps) {
  const data = sessions.map((s) => ({
    x: s.finalScore,
    y: s.collisions,
    name: s.playerName,
    z: s.duration,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="glass-card p-6"
    >
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-white">Score vs Collisions</h3>
        <p className="text-xs text-[#64748b] mt-0.5">Correlation between score and collision count</p>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <ScatterChart margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3d30" />
          <XAxis
            type="number"
            dataKey="x"
            name="Score"
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#2a2a3d30' }}
            tickLine={false}
            label={{ value: 'Score', position: 'insideBottomRight', offset: -5, style: { fontSize: 10, fill: '#64748b' } }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Collisions"
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            label={{ value: 'Collisions', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#64748b' } }}
          />
          <ZAxis type="number" dataKey="z" range={[40, 200]} />
          <Tooltip content={<CustomTooltip />} />
          <Scatter data={data} fill="#8b5cf6" fillOpacity={0.7} />
        </ScatterChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
