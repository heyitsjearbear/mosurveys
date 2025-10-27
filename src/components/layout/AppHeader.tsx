import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

/**
 * AppHeader Component
 * 
 * Reusable navigation header for MoSurveys pages.
 * Features responsive navigation with active state highlighting.
 * 
 * @param activeTab - Current active tab ('overview' | 'surveys' | 'insights')
 */

type ActiveTab = "overview" | "surveys" | "insights";

interface AppHeaderProps {
  activeTab?: ActiveTab;
}

export default function AppHeader({ activeTab }: AppHeaderProps) {
  const isActive = (tab: ActiveTab) => activeTab === tab;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <h1 className="font-heading text-2xl font-semibold text-[#2663EB]">
              MoSurveys
            </h1>
            <span className="ml-2 font-body text-sm text-slate-500">by MoFlo</span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href="/mojeremiah"
              className={`px-3 py-2 font-accent text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive("overview")
                  ? "text-[#2663EB] bg-blue-50"
                  : "text-slate-700 hover:text-[#2663EB] hover:bg-slate-50"
              }`}
            >
              Overview
            </Link>
            <Link
              href="/mojeremiah/view"
              className={`px-3 py-2 font-accent text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive("surveys")
                  ? "text-[#2663EB] bg-blue-50"
                  : "text-slate-700 hover:text-[#2663EB] hover:bg-slate-50"
              }`}
            >
              Surveys
            </Link>
            <Link
              href="/mojeremiah/analytics"
              className={`px-3 py-2 font-accent text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive("insights")
                  ? "text-[#2663EB] bg-blue-50"
                  : "text-slate-700 hover:text-[#2663EB] hover:bg-slate-50"
              }`}
            >
              Insights
            </Link>
          </nav>

          {/* CTA Button */}
          <div>
            <Link
              href="/mojeremiah/create"
              className="group inline-flex items-center gap-3 px-4 py-2 border border-transparent font-accent text-sm font-medium rounded-full text-white bg-[#2663EB] hover:bg-[#2054C8] transition-all duration-200 hover:shadow-md active:scale-95 focus:ring-2 focus:ring-[#2663EB] focus:ring-offset-2"
            >
              <span className="relative w-5 h-5 rounded-full bg-white flex items-center justify-center overflow-hidden">
                <ArrowRightIcon className="w-3 h-3 text-[#2663EB] absolute -translate-x-8 group-hover:translate-x-0 transition-transform duration-300" />
              </span>
              Create Survey
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-slate-200">
        <nav className="flex overflow-x-auto px-4 space-x-4 py-2">
          <Link
            href="/mojeremiah"
            className={`px-3 py-2 font-accent text-sm font-medium rounded-lg whitespace-nowrap ${
              isActive("overview")
                ? "text-[#2663EB] bg-blue-50"
                : "text-slate-700"
            }`}
          >
            Overview
          </Link>
          <Link
            href="/mojeremiah/view"
            className={`px-3 py-2 font-accent text-sm font-medium rounded-lg whitespace-nowrap ${
              isActive("surveys")
                ? "text-[#2663EB] bg-blue-50"
                : "text-slate-700"
            }`}
          >
            Surveys
          </Link>
          <Link
            href="/mojeremiah/analytics"
            className={`px-3 py-2 font-accent text-sm font-medium rounded-lg whitespace-nowrap ${
              isActive("insights")
                ? "text-[#2663EB] bg-blue-50"
                : "text-slate-700"
            }`}
          >
            Insights
          </Link>
        </nav>
      </div>
    </header>
  );
}

