'use client';

import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { motion } from 'framer-motion';
import { Session, GlobalMetrics } from '@/types';

interface PerformanceRadarChartProps {
  session: Session;
  globalMetrics: GlobalMetrics;
  title?: string;
}

export default function PerformanceRadarChart({
  session,
  globalMetrics,
  title = 'Performance Profile',
}: PerformanceRadarChartProps) {
  
  const maxScore = globalMetrics.maxScore || 1;
  const avgCollisions = globalMetrics.totalCollisions / (globalMetrics.totalSessions || 1);
  const avgWrongTurns = globalMetrics.avgWrongTurns || 1;

  const data = [
    {
      subject: 'Score',
      value: Math.min((session.finalScore / maxScore) * 100, 100),
      fullMark: 100,
    },
    {
      subject: 'Efficiency',
      value: Math.min(session.pathEfficiency * 100, 100),
      fullMark: 100,
    },
    {
      subject: 'Speed',
      value: Math.min(
        ((120 - session.duration) / 120) * 100,
        100
      ),
      fullMark: 100,
    },
    {
      subject: 'Navigation',
      value: Math.max(
        100 - (session.collisions / (avgCollisions * 2)) * 100,
        0
      ),
      fullMark: 100,
    },
    {
      subject: 'Decisions',
      value: Math.max(
        100 - (session.averageDecisionTime / 1) * 100,
        0
      ),
      fullMark: 100,
    },
    {
      subject: 'Accuracy',
      value: Math.max(
        100 - (session.wrongTurns / (avgWrongTurns * 2)) * 100,
        0
      ),
      fullMark: 100,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6"
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="text-xs text-[#64748b] mt-0.5">Multi-dimensional performance analysis</p>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#2a2a3d" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
          />
          <PolarRadiusAxis
            tick={false}
            axisLine={false}
            domain={[0, 100]}
          />
          <Radar
            name="Performance"
            dataKey="value"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
