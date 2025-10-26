import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

/**
 * StatCard Component
 * Displays a quick stat with icon and description
 */
interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  color: "blue" | "green" | "purple";
}

export function StatCard({ title, value, description, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-[#2663EB]",
    green: "bg-green-50 text-green-500",
    purple: "bg-gradient-to-r from-[#2663EB] to-[#6366F1] text-white",
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 transition-all duration-200 hover:shadow-md hover:scale-[1.02]">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
      <h3 className="font-heading text-3xl font-semibold text-slate-900 mb-1">{value}</h3>
      <p className="font-accent text-sm font-medium text-slate-700 mb-1">{title}</p>
      <p className="font-body text-xs text-slate-500">{description}</p>
    </div>
  );
}

/**
 * StepCard Component
 * Displays a step in the getting started guide
 */
interface StepCardProps {
  number: number;
  title: string;
  description: string;
  status: "completed" | "active" | "pending";
}

export function StepCard({ number, title, description, status }: StepCardProps) {
  const statusStyles = {
    completed: "bg-[#2663EB] text-white",
    active: "bg-blue-100 text-[#2663EB] border-2 border-[#2663EB]",
    pending: "bg-slate-100 text-slate-400",
  };

  return (
    <div className="flex-1 text-center">
      <div className="flex flex-col items-center">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center font-accent font-semibold mb-3 ${statusStyles[status]}`}
        >
          {number}
        </div>
        <h4 className="font-heading text-sm font-semibold text-slate-900 mb-1">{title}</h4>
        <p className="font-body text-xs text-slate-600">{description}</p>
      </div>
    </div>
  );
}

/**
 * InsightCard Component
 * Displays an insight metric (for future use)
 */
interface InsightCardProps {
  title: string;
  value: string;
  trend: "up" | "down" | "neutral";
}

export function InsightCard({ title, value, trend }: InsightCardProps) {
  const trendIcons = {
    up: <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />,
    down: <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />,
    neutral: <ArrowRightIcon className="w-5 h-5 text-slate-600" />,
  };

  return (
    <div className="bg-slate-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="font-accent text-sm font-medium text-slate-700">{title}</p>
        {trendIcons[trend]}
      </div>
      <p className="font-heading text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

