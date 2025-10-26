import { ReactNode } from "react";

/**
 * AnalyticsStatCard Component
 * 
 * Displays a single metric/stat on the analytics page.
 * Similar to dashboard StatCard but optimized for analytics display.
 */

interface AnalyticsStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  color?: 'blue' | 'green' | 'purple' | 'amber' | 'red' | 'slate';
}

export default function AnalyticsStatCard({ 
  title, 
  value, 
  subtitle,
  icon, 
  trend,
  color = 'blue' 
}: AnalyticsStatCardProps) {
  
  // Color mappings
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-[#2663EB]',
      value: 'text-slate-900',
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      value: 'text-slate-900',
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      value: 'text-slate-900',
    },
    amber: {
      bg: 'bg-amber-50',
      icon: 'text-amber-600',
      value: 'text-slate-900',
    },
    red: {
      bg: 'bg-red-50',
      icon: 'text-red-600',
      value: 'text-slate-900',
    },
    slate: {
      bg: 'bg-slate-50',
      icon: 'text-slate-600',
      value: 'text-slate-900',
    },
  };

  const colors = colorClasses[color];

  // Trend arrow and color
  const getTrendDisplay = () => {
    if (!trend) return null;

    const trendColors = {
      up: 'text-green-600',
      down: 'text-red-600',
      neutral: 'text-slate-500',
    };

    const trendIcons = {
      up: '↑',
      down: '↓',
      neutral: '→',
    };

    return (
      <span className={`inline-flex items-center gap-1 font-accent text-sm font-medium ${trendColors[trend.direction]}`}>
        <span>{trendIcons[trend.direction]}</span>
        {trend.value}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 transition-all duration-200 hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="font-accent text-sm font-medium text-slate-600 mb-1">
            {title}
          </p>
        </div>
        {icon && (
          <div className={`flex-shrink-0 w-10 h-10 ${colors.bg} rounded-full flex items-center justify-center ${colors.icon}`}>
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-2">
        <p className={`font-heading text-3xl font-semibold ${colors.value}`}>
          {value}
        </p>
      </div>

      {/* Subtitle and Trend */}
      <div className="flex items-center justify-between">
        {subtitle && (
          <p className="font-body text-sm text-slate-500">
            {subtitle}
          </p>
        )}
        {getTrendDisplay()}
      </div>
    </div>
  );
}

