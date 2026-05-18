'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import { PlayerMetrics } from '@/types';

interface PlayerComparisonChartProps {
  players: PlayerMetrics[];
  metric: 'avgCollisions' | 'avgWrongTurns' | 'avgScore' | 'avgEfficiency';
  title: string;
  subtitle: string;
  color: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#13131d] border border-[#2a2a3d] rounded-xl p-3 shadow-2xl">
      <p className="text-xs text-[#64748b] mb-1">{label}</p>
      <div className="flex items-center gap-2 text-sm">
        <div className="w-2 h-2 rounded-full" style={{ background: payload[0].fill }} />
        <span className="text-white font-medium">{typeof payload[0].value === 'number' ? payload[0].value.toFixed(1) : payload[0].value}</span>
      </div>
    </div>
  );
};

export default function PlayerComparisonChart({
  players,
  metric,
  title,
  subtitle,
  color,
}: PlayerComparisonChartProps) {
  const data = players.slice(0, 15).map((p) => ({
    name: p.playerName.length > 10 ? p.playerName.slice(0, 10) + '…' : p.playerName,
    value: Number(p[metric].toFixed(1)),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card p-6"
    >
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="text-xs text-[#64748b] mt-0.5">{subtitle}</p>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3d30" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: '#64748b' }}
            axisLine={{ stroke: '#2a2a3d30' }}
            tickLine={false}
            angle={-30}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} />
          <Bar
            dataKey="value"
            fill={color}
            radius={[4, 4, 0, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
