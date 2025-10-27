import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { PageHeader } from "@/components/layout";

/**
 * SurveyViewHeader Component
 * 
 * Header with title and create survey button
 */

export default function SurveyViewHeader() {
  return (
    <PageHeader
      backHref="/mojeremiah"
      backLabel="Back to Dashboard"
      title="Manage Surveys"
      action={
        <Link
          href="/mojeremiah/create"
          className="group inline-flex items-center gap-3 px-4 py-2 border border-transparent font-accent text-sm font-medium rounded-full text-white bg-[#2663EB] hover:bg-[#2054C8] transition-all duration-200 hover:shadow-md active:scale-95 focus:ring-2 focus:ring-[#2663EB] focus:ring-offset-2"
        >
          <span className="relative w-5 h-5 rounded-full bg-white flex items-center justify-center overflow-hidden">
            <ArrowRightIcon className="w-3 h-3 text-[#2663EB] absolute -translate-x-8 group-hover:translate-x-0 transition-transform duration-300" />
          </span>
          Create New
        </Link>
      }
    />
  );
}
