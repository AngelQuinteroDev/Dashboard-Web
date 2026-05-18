'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Clock,
  Wifi,
  WifiOff,
  Calendar,
  X,
  Menu,
} from 'lucide-react';
import { format } from 'date-fns';

interface HeaderProps {
  isConnected: boolean;
  lastUpdate: Date | null;
  playerNames: string[];
  onPlayerSearch: (name: string) => void;
  dateRange: string;
  onDateRangeChange: (range: string) => void;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

const dateRanges = [
  { value: 'all', label: 'All Time' },
  { value: '7', label: 'Last 7 Days' },
  { value: '30', label: 'Last 30 Days' },
  { value: '90', label: 'Last 90 Days' },
];

export default function Header({
  isConnected,
  lastUpdate,
  playerNames,
  onPlayerSearch,
  dateRange,
  onDateRangeChange,
  sidebarCollapsed,
  onToggleSidebar,
}: HeaderProps) {
  const [searchValue, setSearchValue] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredPlayers = searchValue.trim()
    ? playerNames.filter((n) =>
        n.toLowerCase().includes(searchValue.toLowerCase())
      ).slice(0, 8)
    : [];

  return (
    <header
      className="sticky top-0 z-30 h-16 border-b border-[#2a2a3d]/50 flex items-center justify-between px-4 md:px-6"
      style={{
        background: 'linear-gradient(180deg, rgba(10, 10, 15, 0.95), rgba(10, 10, 15, 0.85))',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Left side */}
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden text-[#64748b] hover:text-white transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Search */}
        <div ref={searchRef} className="relative">
          <div className="flex items-center gap-2 bg-[#1a1a24]/80 border border-[#2a2a3d]/50 rounded-xl px-3 py-2 min-w-[200px] md:min-w-[280px] transition-all focus-within:border-[#6366f1]/40 focus-within:shadow-[0_0_15px_rgba(99,102,241,0.1)]">
            <Search size={14} className="text-[#64748b] flex-shrink-0" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                setShowSearch(true);
              }}
              onFocus={() => setShowSearch(true)}
              placeholder="Search players..."
              className="bg-transparent border-none outline-none text-sm text-[#f1f5f9] placeholder-[#64748b] w-full"
            />
            {searchValue && (
              <button
                onClick={() => {
                  setSearchValue('');
                  setShowSearch(false);
                }}
                className="text-[#64748b] hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Search dropdown */}
          <AnimatePresence>
            {showSearch && filteredPlayers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute top-full mt-2 left-0 right-0 bg-[#13131d] border border-[#2a2a3d] rounded-xl overflow-hidden shadow-2xl"
              >
                {filteredPlayers.map((name) => (
                  <button
                    key={name}
                    onClick={() => {
                      onPlayerSearch(name);
                      setSearchValue('');
                      setShowSearch(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-[#94a3b8] hover:text-white hover:bg-[#1a1a24] transition-colors flex items-center gap-3"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6366f1]/20 to-[#8b5cf6]/20 border border-[#6366f1]/30 flex items-center justify-center text-xs font-bold text-[#6366f1]">
                      {name[0]?.toUpperCase()}
                    </div>
                    {name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Date Range */}
        <select
          value={dateRange}
          onChange={(e) => onDateRangeChange(e.target.value)}
          className="hidden sm:block bg-[#1a1a24]/80 border border-[#2a2a3d]/50 rounded-xl px-3 py-2 text-xs text-[#94a3b8] outline-none cursor-pointer hover:border-[#6366f1]/30 transition-colors"
        >
          {dateRanges.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>

        {/* Time */}
        <div className="hidden md:flex items-center gap-2 text-xs text-[#64748b]">
          <Clock size={13} />
          <span className="font-mono" suppressHydrationWarning>
            {currentTime ? format(currentTime, 'HH:mm:ss') : '--:--:--'}
          </span>
        </div>

        {/* Connection status */}
        <div className="flex items-center gap-2">
          <div className={`relative w-2 h-2 rounded-full ${isConnected ? 'bg-[#10b981] pulse-dot' : 'bg-[#f43f5e]'}`} />
          <span className="hidden md:block text-xs text-[#64748b]">
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>
    </header>
  );
}
