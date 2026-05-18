'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { HeatmapCell, Session } from '@/types';
import ActivityHeatmap from '@/charts/ActivityHeatmap';

interface HeatmapsSectionProps {
  heatmapData: HeatmapCell[];
  sessions: Session[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function getCollisionHeatColor(value: number, max: number): string {
  if (value === 0) return 'rgba(26, 26, 36, 0.5)';
  const intensity = value / max;
  if (intensity > 0.8) return 'rgba(244, 63, 94, 0.9)';
  if (intensity > 0.6) return 'rgba(244, 63, 94, 0.65)';
  if (intensity > 0.4) return 'rgba(244, 63, 94, 0.45)';
  if (intensity > 0.2) return 'rgba(244, 63, 94, 0.25)';
  return 'rgba(244, 63, 94, 0.12)';
}

function getScoreHeatColor(value: number, max: number): string {
  if (value === 0) return 'rgba(26, 26, 36, 0.5)';
  const intensity = value / max;
  if (intensity > 0.8) return 'rgba(16, 185, 129, 0.9)';
  if (intensity > 0.6) return 'rgba(16, 185, 129, 0.65)';
  if (intensity > 0.4) return 'rgba(16, 185, 129, 0.45)';
  if (intensity > 0.2) return 'rgba(16, 185, 129, 0.25)';
  return 'rgba(16, 185, 129, 0.12)';
}

export default function HeatmapsSection({ heatmapData, sessions }: HeatmapsSectionProps) {
  // Build collision heatmap
  const collisionMap: Record<string, number> = {};
  const scoreMap: Record<string, { total: number; count: number }> = {};

  sessions.forEach((s) => {
    const day = s.startTime.getDay();
    const hour = s.startTime.getHours();
    const key = `${day}-${hour}`;
    collisionMap[key] = (collisionMap[key] || 0) + s.collisions;
    if (!scoreMap[key]) scoreMap[key] = { total: 0, count: 0 };
    scoreMap[key].total += s.finalScore;
    scoreMap[key].count += 1;
  });

  const collisionHeatmap: HeatmapCell[] = [];
  const scoreHeatmap: HeatmapCell[] = [];

  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const key = `${day}-${hour}`;
      collisionHeatmap.push({ day, hour, value: collisionMap[key] || 0 });
      const sm = scoreMap[key];
      scoreHeatmap.push({ day, hour, value: sm ? Math.round(sm.total / sm.count) : 0 });
    }
  }

  const maxCollision = Math.max(...collisionHeatmap.map((c) => c.value), 1);
  const maxAvgScore = Math.max(...scoreHeatmap.map((c) => c.value), 1);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h2 className="text-xl font-bold text-white">Heatmaps</h2>
        <p className="text-sm text-[#64748b] mt-1">
          Activity and performance patterns by day and hour
        </p>
      </motion.div>

      {/* Activity Heatmap */}
      <ActivityHeatmap data={heatmapData} />

      {/* Collision Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-white">Collision Heatmap</h3>
          <p className="text-xs text-[#64748b] mt-0.5">Total collisions by day and hour</p>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="flex ml-12 mb-1">
              {HOURS.filter((h) => h % 3 === 0).map((h) => (
                <div key={h} className="text-[10px] text-[#64748b] font-mono" style={{ width: `${100 / 8}%`, textAlign: 'center' }}>
                  {h.toString().padStart(2, '0')}:00
                </div>
              ))}
            </div>
            {DAYS.map((day, dayIndex) => (
              <div key={day} className="flex items-center mb-1">
                <span className="text-[10px] text-[#64748b] w-10 text-right mr-2 font-mono">{day}</span>
                <div className="flex flex-1 gap-[2px]">
                  {HOURS.map((hour) => {
                    const cell = collisionHeatmap.find((d) => d.day === dayIndex && d.hour === hour);
                    const value = cell?.value || 0;
                    return (
                      <div
                        key={`${dayIndex}-${hour}`}
                        className="flex-1 aspect-square rounded-[3px] cursor-pointer transition-transform hover:scale-125 relative group"
                        style={{ background: getCollisionHeatColor(value, maxCollision) }}
                      >
                        {value > 0 && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#13131d] border border-[#2a2a3d] rounded-lg text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-xl">
                            {DAYS[dayIndex]} {hour}:00 — {value} collisions
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="flex items-center justify-end gap-2 mt-4">
              <span className="text-[10px] text-[#64748b]">Less</span>
              {[0.1, 0.25, 0.45, 0.65, 0.9].map((opacity, i) => (
                <div key={i} className="w-3 h-3 rounded-[2px]" style={{ background: `rgba(244, 63, 94, ${opacity})` }} />
              ))}
              <span className="text-[10px] text-[#64748b]">More</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Avg Score Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-white">Average Score Heatmap</h3>
          <p className="text-xs text-[#64748b] mt-0.5">Mean score by day and hour</p>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="flex ml-12 mb-1">
              {HOURS.filter((h) => h % 3 === 0).map((h) => (
                <div key={h} className="text-[10px] text-[#64748b] font-mono" style={{ width: `${100 / 8}%`, textAlign: 'center' }}>
                  {h.toString().padStart(2, '0')}:00
                </div>
              ))}
            </div>
            {DAYS.map((day, dayIndex) => (
              <div key={day} className="flex items-center mb-1">
                <span className="text-[10px] text-[#64748b] w-10 text-right mr-2 font-mono">{day}</span>
                <div className="flex flex-1 gap-[2px]">
                  {HOURS.map((hour) => {
                    const cell = scoreHeatmap.find((d) => d.day === dayIndex && d.hour === hour);
                    const value = cell?.value || 0;
                    return (
                      <div
                        key={`${dayIndex}-${hour}`}
                        className="flex-1 aspect-square rounded-[3px] cursor-pointer transition-transform hover:scale-125 relative group"
                        style={{ background: getScoreHeatColor(value, maxAvgScore) }}
                      >
                        {value > 0 && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#13131d] border border-[#2a2a3d] rounded-lg text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-xl">
                            {DAYS[dayIndex]} {hour}:00 — avg {value.toLocaleString()} pts
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="flex items-center justify-end gap-2 mt-4">
              <span className="text-[10px] text-[#64748b]">Low</span>
              {[0.1, 0.25, 0.45, 0.65, 0.9].map((opacity, i) => (
                <div key={i} className="w-3 h-3 rounded-[2px]" style={{ background: `rgba(16, 185, 129, ${opacity})` }} />
              ))}
              <span className="text-[10px] text-[#64748b]">High</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
