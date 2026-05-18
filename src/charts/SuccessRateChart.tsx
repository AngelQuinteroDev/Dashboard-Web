'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { Session } from '@/types';

interface SuccessRateChartProps {
  sessions: Session[];
}

const COLORS = ['#10b981', '#f43f5e'];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#13131d] border border-[#2a2a3d] rounded-xl p-3 shadow-2xl">
      <div className="flex items-center gap-2 text-sm">
        <div className="w-2 h-2 rounded-full" style={{ background: payload[0].payload.fill }} />
        <span className="text-[#94a3b8]">{payload[0].name}:</span>
        <span className="text-white font-medium">{payload[0].value}</span>
      </div>
    </div>
  );
};

export default function SuccessRateChart({ sessions }: SuccessRateChartProps) {
  const succeeded = sessions.filter((s) => s.reachedGoal).length;
  const failed = sessions.length - succeeded;
  const rate = sessions.length > 0 ? ((succeeded / sessions.length) * 100).toFixed(1) : '0';

  const data = [
    { name: 'Completed', value: succeeded },
    { name: 'Failed', value: failed },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="glass-card p-6"
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">Success Rate</h3>
        <p className="text-xs text-[#64748b] mt-0.5">Goal completion ratio</p>
      </div>

      <div className="relative">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{rate}%</p>
            <p className="text-[10px] text-[#64748b] uppercase tracking-wider">Success</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
          <span className="text-xs text-[#94a3b8]">Completed ({succeeded})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]" />
          <span className="text-xs text-[#94a3b8]">Failed ({failed})</span>
        </div>
      </div>
    </motion.div>
  );
}
