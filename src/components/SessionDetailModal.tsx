'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Trophy,
  Clock,
  Target,
  AlertTriangle,
  RotateCcw,
  Pause,
  Brain,
  Route,
  Timer,
  Zap,
} from 'lucide-react';
import { Session, GlobalMetrics } from '@/types';
import { formatDuration, formatDecimal, generateSessionInsights } from '@/utils/metrics';
import { format } from 'date-fns';
import PerformanceRadarChart from '@/charts/PerformanceRadarChart';

interface SessionDetailModalProps {
  session: Session;
  globalMetrics: GlobalMetrics;
  onClose: () => void;
}

export default function SessionDetailModal({
  session,
  globalMetrics,
  onClose,
}: SessionDetailModalProps) {
  const insights = generateSessionInsights(session, globalMetrics);

  const kpis = [
    { label: 'Final Score', value: session.finalScore.toLocaleString(), icon: <Trophy size={16} />, color: '#f59e0b' },
    { label: 'Duration', value: formatDuration(session.duration), icon: <Clock size={16} />, color: '#6366f1' },
    { label: 'Collisions', value: session.collisions, icon: <AlertTriangle size={16} />, color: '#f43f5e' },
    { label: 'Wrong Turns', value: session.wrongTurns, icon: <RotateCcw size={16} />, color: '#a855f7' },
    { label: 'Pauses', value: session.pauseCount, icon: <Pause size={16} />, color: '#ec4899' },
    { label: 'Decision Time', value: `${session.averageDecisionTime.toFixed(3)}s`, icon: <Brain size={16} />, color: '#14b8a6' },
    { label: 'Efficiency', value: `${(session.pathEfficiency * 100).toFixed(1)}%`, icon: <Route size={16} />, color: '#10b981' },
    { label: 'Remaining Time', value: `${session.remainingTime.toFixed(1)}s`, icon: <Timer size={16} />, color: '#0ea5e9' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-10 px-4 overflow-y-auto"
      style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full max-w-4xl mb-10"
      >
        <div className="glass-card overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#2a2a3d]/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6366f1]/20 to-[#8b5cf6]/20 border border-[#6366f1]/20 flex items-center justify-center text-lg font-bold text-[#6366f1]">
                {session.playerName[0]?.toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{session.playerName}</h3>
                <p className="text-xs text-[#64748b]">
                  {format(session.startTime, 'MMMM dd, yyyy · HH:mm:ss')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`badge ${session.reachedGoal ? 'badge-success' : 'badge-danger'}`}>
                {session.reachedGoal ? '✓ Goal Reached' : '✗ Goal Not Reached'}
              </span>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-[#64748b] hover:text-white hover:bg-[#1a1a24] transition-all"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {kpis.map((kpi, i) => (
                <motion.div
                  key={kpi.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-[#1a1a24]/60 border border-[#2a2a3d]/30 rounded-xl p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{ color: kpi.color }}>{kpi.icon}</span>
                    <span className="text-[10px] uppercase text-[#64748b] font-medium tracking-wider">
                      {kpi.label}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-white">{kpi.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Radar + Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PerformanceRadarChart
                session={session}
                globalMetrics={globalMetrics}
              />

              {/* Insights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6"
              >
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Zap size={14} className="text-[#f59e0b]" />
                    Automatic Insights
                  </h3>
                  <p className="text-xs text-[#64748b] mt-0.5">
                    AI-generated performance analysis
                  </p>
                </div>

                <div className="space-y-3">
                  {insights.map((insight, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.08 }}
                      className={`p-3 rounded-xl border ${
                        insight.type === 'positive'
                          ? 'bg-[#10b981]/5 border-[#10b981]/15'
                          : insight.type === 'negative'
                          ? 'bg-[#f43f5e]/5 border-[#f43f5e]/15'
                          : insight.type === 'warning'
                          ? 'bg-[#f59e0b]/5 border-[#f59e0b]/15'
                          : 'bg-[#6366f1]/5 border-[#6366f1]/15'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg">{insight.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {insight.title}
                          </p>
                          <p className="text-xs text-[#94a3b8] mt-0.5">
                            {insight.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Comparison bars vs global averages */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card p-6"
            >
              <h3 className="text-sm font-semibold text-white mb-4">
                Performance vs Global Average
              </h3>
              <div className="space-y-4">
                {[
                  {
                    label: 'Score',
                    value: session.finalScore,
                    avg: globalMetrics.averageScore,
                    max: globalMetrics.maxScore,
                    color: '#f59e0b',
                  },
                  {
                    label: 'Efficiency',
                    value: session.pathEfficiency * 100,
                    avg: globalMetrics.avgEfficiency,
                    max: 100,
                    color: '#10b981',
                  },
                  {
                    label: 'Decision Time',
                    value: session.averageDecisionTime,
                    avg: globalMetrics.avgDecisionTime,
                    max: Math.max(session.averageDecisionTime, globalMetrics.avgDecisionTime) * 2,
                    color: '#6366f1',
                    lowerIsBetter: true,
                  },
                ].map((item, i) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-[#94a3b8]">{item.label}</span>
                      <span className="text-white font-medium">
                        {typeof item.value === 'number' ? item.value.toFixed(item.label === 'Decision Time' ? 3 : 1) : item.value}
                        <span className="text-[#64748b] ml-2">
                          avg: {typeof item.avg === 'number' ? item.avg.toFixed(item.label === 'Decision Time' ? 3 : 1) : item.avg}
                        </span>
                      </span>
                    </div>
                    <div className="relative w-full h-2 bg-[#1a1a24] rounded-full overflow-hidden">
                      {/* Average marker */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-[#64748b] z-10"
                        style={{ left: `${Math.min((item.avg / item.max) * 100, 100)}%` }}
                      />
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((item.value / item.max) * 100, 100)}%` }}
                        transition={{ duration: 0.8, delay: 0.6 + i * 0.1 }}
                        className="h-full rounded-full"
                        style={{ background: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
