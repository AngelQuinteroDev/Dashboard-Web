'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, Trophy, Target, Clock, Zap, ChevronRight } from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import { PlayerMetrics, Session, GlobalMetrics } from '@/types';
import { formatDuration, formatNumber, formatPercentage, formatDecimal } from '@/utils/metrics';
import SessionDetailModal from '@/components/SessionDetailModal';

interface PlayersSectionProps {
  players: PlayerMetrics[];
  globalMetrics: GlobalMetrics;
}

export default function PlayersSection({ players, globalMetrics }: PlayersSectionProps) {
  const [search, setSearch] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerMetrics | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return players;
    return players.filter((p) =>
      p.playerName.toLowerCase().includes(search.toLowerCase())
    );
  }, [players, search]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h2 className="text-xl font-bold text-white">Players</h2>
        <p className="text-sm text-[#64748b] mt-1">
          Individual player profiles and statistics
        </p>
      </motion.div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-[#1a1a24]/80 border border-[#2a2a3d]/50 rounded-xl px-3 py-2 max-w-sm focus-within:border-[#6366f1]/40">
        <Search size={14} className="text-[#64748b]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search players..."
          className="bg-transparent border-none outline-none text-sm text-[#f1f5f9] placeholder-[#64748b] w-full"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player List */}
        <div className="space-y-2">
          {filtered.map((player, i) => (
            <motion.button
              key={player.playerName}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setSelectedPlayer(player)}
              className={`w-full glass-card p-4 text-left transition-all group ${
                selectedPlayer?.playerName === player.playerName
                  ? 'border-[#6366f1]/40 glow-indigo'
                  : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1]/20 to-[#8b5cf6]/20 border border-[#6366f1]/20 flex items-center justify-center text-sm font-bold text-[#6366f1]">
                  {player.playerName[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{player.playerName}</p>
                  <p className="text-xs text-[#64748b]">
                    {player.totalSessions} sessions · Best: {formatNumber(player.bestScore)}
                  </p>
                </div>
                <ChevronRight size={14} className="text-[#64748b] group-hover:text-[#6366f1] transition-colors" />
              </div>
            </motion.button>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-[#64748b] text-center py-8">No players found</p>
          )}
        </div>

        {/* Player Detail */}
        <div className="lg:col-span-2">
          {selectedPlayer ? (
            <motion.div
              key={selectedPlayer.playerName}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Player Header */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6366f1]/20 to-[#8b5cf6]/20 border border-[#6366f1]/20 flex items-center justify-center text-2xl font-bold text-[#6366f1]">
                    {selectedPlayer.playerName[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedPlayer.playerName}</h3>
                    <p className="text-sm text-[#64748b]">
                      {selectedPlayer.totalSessions} total sessions · {formatDuration(selectedPlayer.totalPlaytime)} total playtime
                    </p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Best Score', value: formatNumber(selectedPlayer.bestScore), icon: <Trophy size={14} />, color: '#f59e0b' },
                    { label: 'Avg Score', value: formatNumber(selectedPlayer.avgScore), icon: <Target size={14} />, color: '#6366f1' },
                    { label: 'Success Rate', value: formatPercentage(selectedPlayer.successRate), icon: <Zap size={14} />, color: '#10b981' },
                    { label: 'Avg Duration', value: formatDuration(selectedPlayer.avgDuration), icon: <Clock size={14} />, color: '#06b6d4' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-[#1a1a24]/60 border border-[#2a2a3d]/30 rounded-xl p-3 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1.5">
                        <span style={{ color: stat.color }}>{stat.icon}</span>
                        <span className="text-[9px] uppercase text-[#64748b] tracking-wider">{stat.label}</span>
                      </div>
                      <p className="text-lg font-bold text-white">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Player Radar */}
              <div className="glass-card p-6">
                <h4 className="text-sm font-semibold text-white mb-4">Player Profile</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart
                    data={[
                      { subject: 'Score', value: Math.min((selectedPlayer.bestScore / (globalMetrics.maxScore || 1)) * 100, 100), fullMark: 100 },
                      { subject: 'Efficiency', value: Math.min(selectedPlayer.avgEfficiency, 100), fullMark: 100 },
                      { subject: 'Speed', value: Math.min(((120 - selectedPlayer.avgDuration) / 120) * 100, 100), fullMark: 100 },
                      { subject: 'Navigation', value: Math.max(100 - selectedPlayer.avgCollisions * 2, 0), fullMark: 100 },
                      { subject: 'Decisions', value: Math.max(100 - selectedPlayer.avgDecisionTime * 200, 0), fullMark: 100 },
                      { subject: 'Accuracy', value: Math.max(100 - selectedPlayer.avgWrongTurns, 0), fullMark: 100 },
                    ]}
                  >
                    <PolarGrid stroke="#2a2a3d" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                    <Radar dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Player Sessions */}
              <div className="glass-card p-6">
                <h4 className="text-sm font-semibold text-white mb-4">Session History</h4>
                <div className="space-y-2">
                  {selectedPlayer.sessions.slice(0, 10).map((session, i) => (
                    <motion.button
                      key={session.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => setSelectedSession(session)}
                      className="w-full flex items-center gap-4 p-3 rounded-xl bg-[#1a1a24]/40 hover:bg-[#1e1e2e]/40 transition-colors text-left"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-[#f59e0b] font-mono">
                            {session.finalScore.toLocaleString()}
                          </span>
                          <span className={`badge text-[10px] ${session.reachedGoal ? 'badge-success' : 'badge-danger'}`}>
                            {session.reachedGoal ? 'Goal' : 'Failed'}
                          </span>
                        </div>
                        <p className="text-xs text-[#64748b] mt-0.5">
                          {formatDuration(session.duration)} · {session.collisions} collisions · {(session.pathEfficiency * 100).toFixed(1)}% eff
                        </p>
                      </div>
                      <span className="text-[10px] text-[#64748b] font-mono">
                        {new Date(session.startTime).toLocaleDateString()}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
              <Users size={48} className="text-[#2a2a3d] mb-4" />
              <p className="text-sm text-[#64748b]">Select a player to view their profile</p>
            </div>
          )}
        </div>
      </div>

      {/* Session Detail Modal */}
      <AnimatePresence>
        {selectedSession && (
          <SessionDetailModal
            session={selectedSession}
            globalMetrics={globalMetrics}
            onClose={() => setSelectedSession(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
