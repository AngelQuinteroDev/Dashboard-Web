'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Database, Palette, Bell, Info, ExternalLink } from 'lucide-react';

export default function SettingsSection() {
  const [firebaseProjectId, setFirebaseProjectId] = useState(
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || ''
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h2 className="text-xl font-bold text-white">Settings</h2>
        <p className="text-sm text-[#64748b] mt-1">
          Dashboard configuration and preferences
        </p>
      </motion.div>

      {/* Firebase Config */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/20 flex items-center justify-center">
            <Database size={16} className="text-[#f59e0b]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Firebase Configuration</h3>
            <p className="text-xs text-[#64748b]">Manage your Firestore connection</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase text-[#64748b] font-medium tracking-wider">Project ID</label>
            <input
              type="text"
              value={firebaseProjectId}
              readOnly
              className="input-dark w-full mt-1 opacity-60"
            />
            <p className="text-[10px] text-[#4a5568] mt-1">
              Configure via NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variable
            </p>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[#6366f1]/5 border border-[#6366f1]/15">
            <Info size={14} className="text-[#6366f1] flex-shrink-0" />
            <p className="text-xs text-[#94a3b8]">
              Firebase credentials are configured through environment variables in your <code className="text-[#6366f1]">.env.local</code> file.
            </p>
          </div>
        </div>
      </motion.div>

      {/* About */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-[#6366f1]/10 border border-[#6366f1]/20 flex items-center justify-center">
            <Info size={16} className="text-[#6366f1]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">About</h3>
            <p className="text-xs text-[#64748b]">Maze Analytics Dashboard</p>
          </div>
        </div>

        <div className="space-y-3 text-sm text-[#94a3b8]">
          <p>
            <span className="text-white font-medium">Maze Analytics</span> is a real-time gaming analytics dashboard
            built to visualize player behavior, performance metrics, and gameplay patterns from a Unity maze game.
          </p>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {[
              { label: 'Framework', value: 'Next.js 15' },
              { label: 'Database', value: 'Firebase Firestore' },
              { label: 'Charts', value: 'Recharts' },
              { label: 'Animations', value: 'Framer Motion' },
              { label: 'Styling', value: 'TailwindCSS' },
              { label: 'Language', value: 'TypeScript' },
            ].map((item) => (
              <div key={item.label} className="bg-[#1a1a24]/60 border border-[#2a2a3d]/30 rounded-xl p-3">
                <p className="text-[10px] text-[#64748b] uppercase tracking-wider">{item.label}</p>
                <p className="text-sm text-white font-medium mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
