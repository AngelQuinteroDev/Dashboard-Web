'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  color: string;
  delay?: number;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendLabel,
  color,
  delay = 0,
}: MetricCardProps) {
  const isPositive = trend !== undefined && trend > 0;
  const isNegative = trend !== undefined && trend < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.05, ease: [0.4, 0, 0.2, 1] }}
      className="glass-card p-5 relative overflow-hidden group"
    >
      {/* Background gradient accent */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-500 blur-2xl"
        style={{ background: color }}
      />

      {/* Icon & Title Row */}
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: `${color}15`,
            border: `1px solid ${color}25`,
          }}
        >
          <span style={{ color }}>{icon}</span>
        </div>

        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
              isPositive
                ? 'bg-[#10b981]/10 text-[#10b981]'
                : isNegative
                ? 'bg-[#f43f5e]/10 text-[#f43f5e]'
                : 'bg-[#64748b]/10 text-[#64748b]'
            }`}
          >
            {isPositive ? (
              <TrendingUp size={12} />
            ) : isNegative ? (
              <TrendingDown size={12} />
            ) : (
              <Minus size={12} />
            )}
            <span>{Math.abs(trend).toFixed(1)}%</span>
          </div>
        )}
      </div>

      {/* Value */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay * 0.05 + 0.2 }}
        className="mb-1"
      >
        <h3 className="text-2xl font-bold text-white tracking-tight">
          {value}
        </h3>
      </motion.div>

      {/* Title & Subtitle */}
      <p className="text-xs text-[#64748b] font-medium tracking-wide uppercase">
        {title}
      </p>
      {subtitle && (
        <p className="text-xs text-[#4a5568] mt-0.5">{subtitle}</p>
      )}
    </motion.div>
  );
}
