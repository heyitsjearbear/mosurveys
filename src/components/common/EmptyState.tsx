import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

/**
 * EmptyState Component
 * 
 * Reusable empty state with icon, message, and CTA
 * Used across multiple pages for consistent empty state UX
 */

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  const buttonContent = (
    <>
      <span className="relative w-6 h-6 rounded-full bg-white flex items-center justify-center overflow-hidden">
        <ArrowRightIcon className="w-4 h-4 text-[#2663EB] absolute -translate-x-8 group-hover:translate-x-0 transition-transform duration-300" />
      </span>
      {actionLabel}
    </>
  );

  const buttonClasses = "group inline-flex items-center gap-3 px-6 py-3 border border-transparent font-accent text-base font-medium rounded-full text-white bg-[#2663EB] hover:bg-[#2054C8] transition-all duration-200 hover:shadow-md active:scale-95 focus:ring-2 focus:ring-[#2663EB] focus:ring-offset-2";

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
            {icon}
          </div>
        </div>
        <h3 className="font-heading text-xl font-semibold text-slate-900 mb-2">
          {title}
        </h3>
        <p className="font-body text-slate-600 leading-relaxed mb-6">
          {description}
        </p>
        {(actionLabel && actionHref) && (
          <Link href={actionHref} className={buttonClasses}>
            {buttonContent}
          </Link>
        )}
        {(actionLabel && onAction) && (
          <button onClick={onAction} className={buttonClasses}>
            {buttonContent}
          </button>
        )}
      </div>
    </div>
  );
}

