'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className = '', style }: SkeletonProps) {
  return <div className={`skeleton ${className}`} style={style} />;
}

export function MetricCardSkeleton() {
  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between mb-3">
        <Skeleton className="w-10 h-10" />
        <Skeleton className="w-16 h-6" />
      </div>
      <Skeleton className="w-24 h-8 mb-2" />
      <Skeleton className="w-32 h-3" />
    </div>
  );
}

export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="w-40 h-5" />
        <Skeleton className="w-24 h-7" />
      </div>
      <Skeleton className={`w-full`} style={{ height }} />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="glass-card p-6">
      <Skeleton className="w-48 h-6 mb-6" />
      <div className="space-y-3">
        <div className="flex gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="flex-1 h-8" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            {[1, 2, 3, 4, 5].map((j) => (
              <Skeleton key={j} className="flex-1 h-10" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function LeaderboardSkeleton() {
  return (
    <div className="glass-card p-6">
      <Skeleton className="w-40 h-6 mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="flex-1 h-5" />
            <Skeleton className="w-20 h-5" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  );
}
