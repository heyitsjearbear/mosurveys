"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRightIcon, CheckIcon } from "@heroicons/react/24/outline";

// ─────────────────────────────────────────────
// Publish Modal Component
// ─────────────────────────────────────────────

interface PublishModalProps {
  surveyTitle: string;
  surveyId?: string; // Optional for now (mock mode)
  onClose: () => void;
}

export function PublishModal({ surveyTitle, surveyId, onClose }: PublishModalProps) {
  const [copied, setCopied] = useState(false);
  
  // Generate survey link (mock for now, will use real ID later)
  const surveyLink = surveyId 
    ? `${window.location.origin}/mojeremiah/respond/${surveyId}`
    : "https://mosurveys.app/respond/abc123";

  const handleCopy = () => {
    navigator.clipboard.writeText(surveyLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckIcon className="w-8 h-8 text-green-600" />
        </div>

        {/* Modal Content */}
        <h2 className="font-heading text-2xl font-semibold text-slate-900 text-center mb-2">
          Survey Published!
        </h2>
        <p className="font-body text-base text-slate-600 text-center mb-6">
          <span className="font-medium">{surveyTitle}</span> is now live and ready to collect
          responses.
        </p>

        {/* Survey Link */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
          <label className="block font-body text-sm font-medium text-slate-700 mb-2">
            Share this link:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={surveyLink}
              readOnly
              className="flex-1 px-3 py-2 font-mono text-sm bg-white border border-slate-300 rounded-lg"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-[#2663EB] text-white font-accent text-sm font-medium rounded-lg hover:bg-[#2054C8] transition-colors duration-200 active:scale-95"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/mojeremiah"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-300 font-accent text-base font-medium rounded-full text-slate-700 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 transition-all duration-200 active:scale-95"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/mojeremiah/view"
            className="group flex-1 inline-flex items-center justify-center gap-3 px-6 py-3 border border-transparent font-accent text-base font-medium rounded-full text-white bg-[#2663EB] hover:bg-[#2054C8] shadow-sm hover:shadow-md transition-all duration-200 active:scale-95"
          >
            View All Surveys
            <span className="relative w-6 h-6 rounded-full bg-white flex items-center justify-center overflow-hidden">
              <ArrowRightIcon className="w-4 h-4 text-[#2663EB] absolute -translate-x-8 group-hover:translate-x-0 transition-transform duration-300" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

