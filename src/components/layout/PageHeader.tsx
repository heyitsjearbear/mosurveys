import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

/**
 * PageHeader Component
 * 
 * Reusable header for all MoSurveys pages with consistent styling
 * Includes back navigation, title, subtitle, and optional action buttons
 * 
 * @example
 * <PageHeader
 *   backHref="/mojeremiah"
 *   backLabel="Back to Dashboard"
 *   title="Create Survey"
 *   subtitle="Step 1 of 3"
 *   action={<button>Save</button>}
 * />
 */

interface PageHeaderProps {
  /** Href for back navigation link */
  backHref: string;
  /** Label for back button (e.g. "Back to Dashboard") */
  backLabel: string;
  /** Main page title */
  title: string;
  /** Optional subtitle or description (can be string or React node) */
  subtitle?: React.ReactNode;
  /** Optional action button(s) on the right side */
  action?: React.ReactNode;
  /** Whether header should be sticky (default: false) */
  sticky?: boolean;
}

export default function PageHeader({
  backHref,
  backLabel,
  title,
  subtitle,
  action,
  sticky = false,
}: PageHeaderProps) {
  return (
    <header className={`bg-white border-b border-slate-200 ${sticky ? 'sticky top-0 z-40' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Back Button */}
          <Link
            href={backHref}
            className="group inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors duration-200"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="font-accent text-sm font-medium">{backLabel}</span>
          </Link>

          {/* Title & Subtitle */}
          <div className="text-center">
            <h1 className="font-heading text-2xl font-semibold text-slate-900">
              {title}
            </h1>
            {subtitle && (
              <div className="font-accent text-xs text-slate-500 mt-1">
                {subtitle}
              </div>
            )}
          </div>

          {/* Action Button or Spacer */}
          {action ? (
            <div>{action}</div>
          ) : (
            <div className="w-32" /> // Spacer for center alignment
          )}
        </div>
      </div>
    </header>
  );
}

