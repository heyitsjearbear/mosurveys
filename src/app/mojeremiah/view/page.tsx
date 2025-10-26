"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ClipboardDocumentListIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  LinkIcon,
  ChartBarIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/types/supabase";

type Survey = Database["public"]["Tables"]["surveys"]["Row"];

// ─────────────────────────────────────────────
// Survey Management Page
// ─────────────────────────────────────────────
// Displays all surveys with filtering, sorting, and management actions

// Get default org ID from environment or use fallback
const DEFAULT_ORG_ID = process.env.NEXT_PUBLIC_DEFAULT_ORG_ID || '00000000-0000-0000-0000-000000000001';

export default function SurveyViewPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch surveys on mount
  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("surveys")
        .select("*")
        .eq("org_id", DEFAULT_ORG_ID)
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setSurveys(data || []);
    } catch (err) {
      console.error("Error fetching surveys:", err);
      setError("Failed to load surveys. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (surveyId: string) => {
    const link = `${window.location.origin}/mojeremiah/respond/${surveyId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(surveyId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (surveyId: string) => {
    if (!confirm("Are you sure you want to delete this survey?")) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from("surveys")
        .delete()
        .eq("id", surveyId);

      if (deleteError) {
        throw deleteError;
      }

      // Refresh the list
      fetchSurveys();
    } catch (err) {
      console.error("Error deleting survey:", err);
      alert("Failed to delete survey. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/mojeremiah"
              className="group inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors duration-200"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span className="font-accent text-sm font-medium">Back to Dashboard</span>
            </Link>
            <h1 className="font-heading text-2xl font-semibold text-slate-900">
              Manage Surveys
            </h1>
            <Link
              href="/mojeremiah/create"
              className="group inline-flex items-center gap-3 px-4 py-2 border border-transparent font-accent text-sm font-medium rounded-full text-white bg-[#2663EB] hover:bg-[#2054C8] transition-all duration-200 hover:shadow-md active:scale-95 focus:ring-2 focus:ring-[#2663EB] focus:ring-offset-2"
            >
              <span className="relative w-5 h-5 rounded-full bg-white flex items-center justify-center overflow-hidden">
                <ArrowRightIcon className="w-3 h-3 text-[#2663EB] absolute -translate-x-8 group-hover:translate-x-0 transition-transform duration-300" />
              </span>
              Create New
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#2663EB] border-t-transparent"></div>
            <p className="font-body text-slate-600 mt-4">Loading surveys...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="font-body text-red-700">{error}</p>
            <button
              onClick={fetchSurveys}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && surveys.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12">
            <div className="text-center max-w-md mx-auto">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                  <ClipboardDocumentListIcon className="w-8 h-8 text-[#2663EB]" />
                </div>
              </div>
              <h3 className="font-heading text-xl font-semibold text-slate-900 mb-2">
                No Surveys Yet
              </h3>
              <p className="font-body text-slate-600 leading-relaxed mb-6">
                Get started by creating your first survey. Design questions, share with your audience, and collect valuable feedback.
              </p>
              <Link
                href="/mojeremiah/create"
                className="group inline-flex items-center gap-3 px-6 py-3 border border-transparent font-accent text-base font-medium rounded-full text-white bg-[#2663EB] hover:bg-[#2054C8] transition-all duration-200 hover:shadow-md active:scale-95 focus:ring-2 focus:ring-[#2663EB] focus:ring-offset-2"
              >
                <span className="relative w-6 h-6 rounded-full bg-white flex items-center justify-center overflow-hidden">
                  <ArrowRightIcon className="w-4 h-4 text-[#2663EB] absolute -translate-x-8 group-hover:translate-x-0 transition-transform duration-300" />
                </span>
                Create Your First Survey
              </Link>
            </div>
          </div>
        )}

        {/* Surveys Grid */}
        {!loading && !error && surveys.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {surveys.map((survey) => (
              <div
                key={survey.id}
                className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
              >
                {/* Survey Header */}
                <div className="mb-4">
                  <h3 className="font-heading text-lg font-semibold text-slate-900 mb-1">
                    {survey.title}
                  </h3>
                  {survey.audience && (
                    <p className="font-body text-sm text-slate-600">
                      Audience: {survey.audience}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-[#2663EB] font-accent text-xs font-medium rounded-full">
                      v{survey.version}
                    </span>
                    <span className="font-body text-xs text-slate-500">
                      {new Date(survey.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCopyLink(survey.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 font-accent text-xs font-medium rounded-lg transition-colors duration-200"
                    title="Copy shareable link"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    {copiedId === survey.id ? "Copied!" : "Copy Link"}
                  </button>
                  
                  <Link
                    href={`/mojeremiah/analytics/${survey.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-[#2663EB] hover:bg-blue-200 font-accent text-xs font-medium rounded-lg transition-colors duration-200"
                    title="View analytics"
                  >
                    <ChartBarIcon className="w-3.5 h-3.5" />
                    Analytics
                  </Link>

                  <button
                    onClick={() => handleDelete(survey.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 font-accent text-xs font-medium rounded-lg transition-colors duration-200"
                    title="Delete survey"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

