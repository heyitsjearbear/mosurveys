import { ReactNode } from "react";

interface AnalyticsStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  color?: "blue" | "green" | "red" | "purple" | "amber" | "slate";
}

export default function AnalyticsStatCard({
  title,
  value,
  subtitle,
  icon,
  color = "blue",
}: AnalyticsStatCardProps) {
  const colorClasses = {
    blue: "text-[#2663EB] bg-blue-50",
    green: "text-green-600 bg-green-50",
    red: "text-red-600 bg-red-50",
    purple: "text-purple-600 bg-purple-50",
    amber: "text-amber-600 bg-amber-50",
    slate: "text-slate-600 bg-slate-50",
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="font-body text-sm text-slate-600">{title}</span>
        {icon && (
          <span className={`${colorClasses[color]} p-2 rounded-lg`}>{icon}</span>
        )}
      </div>
      <p className="font-heading text-3xl font-semibold text-slate-900 mb-1">
        {value}
      </p>
      {subtitle && (
        <p className="font-body text-xs text-slate-500">{subtitle}</p>
      )}
    </div>
  );
}
