'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { HeatmapCell } from '@/types';

interface ActivityHeatmapProps {
  data: HeatmapCell[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function getHeatColor(value: number, max: number): string {
  if (value === 0) return 'rgba(26, 26, 36, 0.5)';
  const intensity = value / max;
  if (intensity > 0.8) return 'rgba(99, 102, 241, 0.9)';
  if (intensity > 0.6) return 'rgba(99, 102, 241, 0.65)';
  if (intensity > 0.4) return 'rgba(99, 102, 241, 0.45)';
  if (intensity > 0.2) return 'rgba(99, 102, 241, 0.25)';
  return 'rgba(99, 102, 241, 0.12)';
}

export default function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card p-6"
    >
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-white">Activity Heatmap</h3>
        <p className="text-xs text-[#64748b] mt-0.5">Session activity by day and hour</p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Hour labels */}
          <div className="flex ml-12 mb-1">
            {HOURS.filter((h) => h % 3 === 0).map((h) => (
              <div
                key={h}
                className="text-[10px] text-[#64748b] font-mono"
                style={{ width: `${100 / 8}%`, textAlign: 'center' }}
              >
                {h.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Grid */}
          {DAYS.map((day, dayIndex) => (
            <div key={day} className="flex items-center mb-1">
              <span className="text-[10px] text-[#64748b] w-10 text-right mr-2 font-mono">
                {day}
              </span>
              <div className="flex flex-1 gap-[2px]">
                {HOURS.map((hour) => {
                  const cell = data.find(
                    (d) => d.day === dayIndex && d.hour === hour
                  );
                  const value = cell?.value || 0;
                  return (
                    <motion.div
                      key={`${dayIndex}-${hour}`}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: (dayIndex * 24 + hour) * 0.002,
                        duration: 0.3,
                      }}
                      className="flex-1 aspect-square rounded-[3px] cursor-pointer transition-transform hover:scale-125 relative group"
                      style={{ background: getHeatColor(value, maxVal) }}
                    >
                      {value > 0 && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#13131d] border border-[#2a2a3d] rounded-lg text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-xl">
                          {DAYS[dayIndex]} {hour}:00 — {value} session{value !== 1 ? 's' : ''}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center justify-end gap-2 mt-4">
            <span className="text-[10px] text-[#64748b]">Less</span>
            {[0.1, 0.25, 0.45, 0.65, 0.9].map((opacity, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-[2px]"
                style={{ background: `rgba(99, 102, 241, ${opacity})` }}
              />
            ))}
            <span className="text-[10px] text-[#64748b]">More</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
