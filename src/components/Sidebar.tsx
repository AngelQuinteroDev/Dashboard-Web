'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Trophy,
  ListChecks,
  Users,
  BarChart3,
  Gauge,
  Grid3X3,
  TrendingUp,
  Settings,
  Gamepad2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { SidebarSection } from '@/types';

interface SidebarProps {
  activeSection: SidebarSection;
  onSectionChange: (section: SidebarSection) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const menuItems: { id: SidebarSection; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={20} /> },
  { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy size={20} /> },
  { id: 'sessions', label: 'Sessions', icon: <ListChecks size={20} /> },
  { id: 'players', label: 'Players', icon: <Users size={20} /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
  { id: 'performance', label: 'Performance', icon: <Gauge size={20} /> },
  { id: 'heatmaps', label: 'Heatmaps', icon: <Grid3X3 size={20} /> },
  { id: 'trends', label: 'Trends', icon: <TrendingUp size={20} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
];

export default function Sidebar({ activeSection, onSectionChange, collapsed, onToggleCollapse }: SidebarProps) {
  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r border-[#2a2a3d]/50"
      style={{
        background: 'linear-gradient(180deg, #0e0e16 0%, #0a0a0f 100%)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-[#2a2a3d]/50">
        <motion.div
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.5 }}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          }}
        >
          <Gamepad2 size={20} className="text-white" />
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <h1 className="text-sm font-bold tracking-tight text-white whitespace-nowrap">
                Maze Analytics
              </h1>
              <p className="text-[10px] text-[#64748b] whitespace-nowrap">Gaming Dashboard</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 relative group
                ${isActive
                  ? 'text-white'
                  : 'text-[#64748b] hover:text-[#94a3b8]'
                }
              `}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.1))',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                  }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              
              <span className={`relative z-10 flex-shrink-0 ${isActive ? 'text-[#6366f1]' : ''}`}>
                {item.icon}
              </span>
              
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative z-10 whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Tooltip when collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#1a1a24] border border-[#2a2a3d] rounded-lg text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                  {item.label}
                </div>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-[#2a2a3d]/50">
        <motion.button
          onClick={onToggleCollapse}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[#64748b] hover:text-[#94a3b8] hover:bg-[#1a1a24] transition-all text-xs"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span>Collapse</span>}
        </motion.button>
      </div>
    </motion.aside>
  );
}
