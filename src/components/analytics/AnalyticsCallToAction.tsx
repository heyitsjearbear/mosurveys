import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

/**
 * AnalyticsCallToAction Component
 * 
 * Encourages users to view individual survey analytics for deeper insights.
 * Features a gradient background and prominent call-to-action button.
 */

export default function AnalyticsCallToAction() {
  return (
    <div className="bg-gradient-to-r from-[#2663EB] to-[#6366F1] rounded-lg shadow-sm p-8 text-center">
      <h3 className="font-heading text-xl font-semibold text-white mb-2">
        Dive Deeper into Individual Surveys
      </h3>
      <p className="font-body text-blue-100 leading-relaxed mb-6 max-w-2xl mx-auto">
        View detailed analytics, AI-generated summaries, and response breakdowns for each
        survey.
      </p>
      <Link
        href="/mojeremiah/view"
        className="group inline-flex items-center gap-3 px-6 py-3 border-2 border-white font-accent text-base font-medium rounded-full text-white hover:bg-white hover:text-[#2663EB] transition-all duration-200 active:scale-95"
      >
        <span className="relative w-6 h-6 rounded-full bg-white flex items-center justify-center overflow-hidden group-hover:bg-[#2663EB]">
          <ArrowRightIcon className="w-4 h-4 text-[#2663EB] group-hover:text-white absolute -translate-x-8 group-hover:translate-x-0 transition-all duration-300" />
        </span>
        View All Surveys
      </Link>
    </div>
  );
}

