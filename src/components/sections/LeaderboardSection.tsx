'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trophy, Medal, Crown, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Highscore } from '@/types';
import { formatNumber } from '@/utils/metrics';

interface LeaderboardSectionProps {
  highscores: Highscore[];
}

const ITEMS_PER_PAGE = 20;

export default function LeaderboardSection({ highscores }: LeaderboardSectionProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [topFilter, setTopFilter] = useState<'all' | '10' | '50' | '100'>('all');

  const filtered = useMemo(() => {
    let result = [...highscores];

    if (search.trim()) {
      result = result.filter((h) =>
        h.playerName.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (topFilter !== 'all') {
      result = result.slice(0, parseInt(topFilter));
    }

    return result;
  }, [highscores, search, topFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  const maxScore = highscores[0]?.score || 1;

  function getMedalStyle(rank: number) {
    if (rank === 1) return { bg: 'linear-gradient(135deg, #ffd700, #ffaa00)', text: '#1a1a24', icon: <Crown size={16} /> };
    if (rank === 2) return { bg: 'linear-gradient(135deg, #c0c0c0, #a0a0a0)', text: '#1a1a24', icon: <Medal size={16} /> };
    if (rank === 3) return { bg: 'linear-gradient(135deg, #cd7f32, #b8691e)', text: '#1a1a24', icon: <Star size={16} /> };
    return null;
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <h2 className="text-xl font-bold text-white">Leaderboard</h2>
        <p className="text-sm text-[#64748b] mt-1">Top players ranked by highest score</p>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        {/* Search */}
        <div className="flex items-center gap-2 bg-[#1a1a24]/80 border border-[#2a2a3d]/50 rounded-xl px-3 py-2 flex-1 max-w-sm focus-within:border-[#6366f1]/40">
          <Search size={14} className="text-[#64748b]" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search players..."
            className="bg-transparent border-none outline-none text-sm text-[#f1f5f9] placeholder-[#64748b] w-full"
          />
        </div>

        {/* Top filter */}
        <div className="flex gap-2">
          {(['all', '10', '50', '100'] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setTopFilter(f); setPage(0); }}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                topFilter === f
                  ? 'bg-[#6366f1]/20 text-[#6366f1] border border-[#6366f1]/30'
                  : 'bg-[#1a1a24]/50 text-[#64748b] border border-[#2a2a3d]/50 hover:text-[#94a3b8]'
              }`}
            >
              {f === 'all' ? 'All' : `Top ${f}`}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Top 3 Podium */}
      {page === 0 && !search && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {highscores.slice(0, 3).map((player, i) => {
            const medal = getMedalStyle(i + 1);
            const order = i === 0 ? 'sm:order-2' : i === 1 ? 'sm:order-1' : 'sm:order-3';
            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 200 }}
                className={`glass-card p-6 text-center relative overflow-hidden group ${order} ${
                  i === 0 ? 'sm:transform sm:-translate-y-2' : ''
                }`}
              >
                {/* Glow */}
                <div
                  className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity"
                  style={{ background: medal?.bg }}
                />
                
                {/* Rank */}
                <div
                  className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center text-lg font-bold"
                  style={{ background: medal?.bg, color: medal?.text }}
                >
                  {medal?.icon}
                </div>

                {/* Avatar */}
                <div className="w-16 h-16 rounded-2xl mx-auto mb-3 bg-gradient-to-br from-[#6366f1]/20 to-[#8b5cf6]/20 border border-[#6366f1]/20 flex items-center justify-center text-xl font-bold text-[#6366f1]">
                  {player.playerName[0]?.toUpperCase()}
                </div>

                <h4 className="text-sm font-semibold text-white mb-1 truncate">
                  {player.playerName}
                </h4>
                <p className="text-2xl font-bold font-mono" style={{ color: i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : '#cd7f32' }}>
                  {formatNumber(player.score)}
                </p>
                <p className="text-[10px] text-[#64748b] uppercase tracking-widest mt-1">
                  #{i + 1} Worldwide
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2a3d]/50">
                <th className="text-left text-[10px] uppercase tracking-wider text-[#64748b] font-medium px-6 py-4 w-16">Rank</th>
                <th className="text-left text-[10px] uppercase tracking-wider text-[#64748b] font-medium px-6 py-4">Player</th>
                <th className="text-right text-[10px] uppercase tracking-wider text-[#64748b] font-medium px-6 py-4 w-32">Score</th>
                <th className="text-right text-[10px] uppercase tracking-wider text-[#64748b] font-medium px-6 py-4 w-40 hidden sm:table-cell">Bar</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="wait">
                {paginated.map((player, i) => {
                  const globalRank = page * ITEMS_PER_PAGE + i + 1;
                  const medal = getMedalStyle(player.rank || globalRank);
                  const barWidth = (player.score / maxScore) * 100;

                  return (
                    <motion.tr
                      key={player.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-[#2a2a3d]/20 table-row-hover"
                    >
                      <td className="px-6 py-3">
                        {medal ? (
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                            style={{ background: medal.bg, color: medal.text }}
                          >
                            {player.rank || globalRank}
                          </div>
                        ) : (
                          <span className="text-sm text-[#64748b] font-mono">
                            #{player.rank || globalRank}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366f1]/15 to-[#8b5cf6]/15 border border-[#6366f1]/15 flex items-center justify-center text-xs font-bold text-[#6366f1]">
                            {player.playerName[0]?.toUpperCase()}
                          </div>
                          <span className="text-sm text-white font-medium">
                            {player.playerName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <span className="text-sm font-bold text-[#f59e0b] font-mono">
                          {formatNumber(player.score)}
                        </span>
                      </td>
                      <td className="px-6 py-3 hidden sm:table-cell">
                        <div className="w-full h-2 bg-[#1a1a24] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${barWidth}%` }}
                            transition={{ duration: 0.8, delay: i * 0.03 }}
                            className="h-full rounded-full"
                            style={{
                              background: `linear-gradient(90deg, #6366f1, #8b5cf6)`,
                            }}
                          />
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#2a2a3d]/50">
            <p className="text-xs text-[#64748b]">
              Showing {page * ITEMS_PER_PAGE + 1}–{Math.min((page + 1) * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="p-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3d]/50 text-[#94a3b8] disabled:opacity-30 hover:bg-[#1e1e2e] transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3d]/50 text-[#94a3b8] disabled:opacity-30 hover:bg-[#1e1e2e] transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
