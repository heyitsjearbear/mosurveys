"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ClipboardDocumentListIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/types/supabase";
import { LoadingState, ErrorState, EmptyState } from "@/components/common";
import { SurveyCard } from "@/components/survey/manage";

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
        {loading && <LoadingState message="Loading surveys..." />}

        {/* Error State */}
        {error && !loading && (
          <ErrorState message={error} onRetry={fetchSurveys} />
        )}

        {/* Empty State */}
        {!loading && !error && surveys.length === 0 && (
          <EmptyState
            icon={<ClipboardDocumentListIcon className="w-8 h-8 text-[#2663EB]" />}
            title="No Surveys Yet"
            description="Get started by creating your first survey. Design questions, share with your audience, and collect valuable feedback."
            actionLabel="Create Your First Survey"
            actionHref="/mojeremiah/create"
          />
        )}

        {/* Surveys Grid */}
        {!loading && !error && surveys.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {surveys.map((survey) => (
              <SurveyCard
                key={survey.id}
                survey={survey}
                copiedId={copiedId}
                onCopyLink={handleCopyLink}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
