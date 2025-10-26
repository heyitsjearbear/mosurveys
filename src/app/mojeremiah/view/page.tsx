"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ClipboardDocumentListIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { supabase } from "@/lib/supabaseClient";
import { createLogger } from "@/lib/logger";
import type { Database } from "@/types/supabase";
import { LoadingState, ErrorState, EmptyState, Toast, ConfirmModal } from "@/components/common";
import SurveyCard from "@/components/survey/manage/SurveyCard";
import { VersionHistoryModal } from "@/components/survey/manage/VersionHistoryModal";
import type { ToastType } from "@/components/common/Toast";

const logger = createLogger('SurveyView');

type Survey = Database["public"]["Tables"]["surveys"]["Row"];

// ─────────────────────────────────────────────
// Survey Management Page
// ─────────────────────────────────────────────
// Displays all surveys with filtering, sorting, and management actions
//
// Features:
// - Optimistic updates for instant UI feedback
// - Custom confirmation modal for deletions
// - Toast notifications for success/error states
// - Cascade deletion (surveys, questions, responses)
// - Loading states during operations

// Get default org ID from environment or use fallback
const DEFAULT_ORG_ID = process.env.NEXT_PUBLIC_DEFAULT_ORG_ID || '00000000-0000-0000-0000-000000000001';

interface ToastState {
  message: string;
  type: ToastType;
  show: boolean;
}

export default function SurveyViewPage() {
  // Survey data state
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>({ message: "", type: "success", show: false });
  const [showAllVersions, setShowAllVersions] = useState(false);
  
  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    surveyId: string | null;
    surveyTitle: string;
  }>({
    show: false,
    surveyId: null,
    surveyTitle: "",
  });

  // Version history modal state
  const [versionHistoryModal, setVersionHistoryModal] = useState<{
    show: boolean;
    surveyId: string | null;
    surveyTitle: string;
  }>({
    show: false,
    surveyId: null,
    surveyTitle: "",
  });

  // Fetch surveys on mount
  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch surveys
      const { data: surveysData, error: fetchError } = await supabase
        .from("surveys")
        .select("*")
        .eq("org_id", DEFAULT_ORG_ID)
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Fetch response counts for each survey
      if (surveysData && surveysData.length > 0) {
        const surveyIds = surveysData.map(s => s.id);
        
        const { data: responseCounts, error: countError } = await supabase
          .from("responses")
          .select("survey_id")
          .in("survey_id", surveyIds);

        if (countError) {
          logger.warn('Failed to fetch response counts', countError);
        } else {
          // Count responses per survey
          const countsMap = (responseCounts || []).reduce((acc, r) => {
            acc[r.survey_id] = (acc[r.survey_id] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          // Add count to each survey
          surveysData.forEach((survey: any) => {
            survey.responseCount = countsMap[survey.id] || 0;
          });
        }
      }

      setSurveys(surveysData || []);
      logger.debug('Surveys fetched successfully', { count: surveysData?.length || 0 });
    } catch (err) {
      logger.error('Failed to fetch surveys', err);
      setError("Failed to load surveys. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // COPY LINK HANDLER
  // ─────────────────────────────────────────────
  const handleCopyLink = (surveyId: string) => {
    const link = `${window.location.origin}/mojeremiah/respond/${surveyId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(surveyId);
    
    // Show success toast
    showToast("Link copied to clipboard!", "success");
    
    // Reset copied state after 2 seconds
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ─────────────────────────────────────────────
  // DELETE HANDLERS - WITH OPTIMISTIC UPDATES
  // ─────────────────────────────────────────────
  
  /**
   * Step 1: Open confirmation modal
   * Shows custom modal instead of browser confirm()
   */
  const handleDeleteClick = (surveyId: string) => {
    const survey = surveys.find((s) => s.id === surveyId);
    if (!survey) return;

    setConfirmModal({
      show: true,
      surveyId: surveyId,
      surveyTitle: survey.title,
    });
  };

  /**
   * Step 2: Execute delete with optimistic update
   * - Removes survey from UI immediately (optimistic)
   * - Makes API call to delete from database
   * - Rolls back if API call fails
   * - Shows toast notification for success/failure
   * - Logs to activity feed (via database trigger)
   */
  const handleDeleteConfirm = async () => {
    const surveyIdToDelete = confirmModal.surveyId;
    const surveyTitle = confirmModal.surveyTitle;
    if (!surveyIdToDelete) return;

    // Close modal
    setConfirmModal({ show: false, surveyId: null, surveyTitle: "" });

    // Set loading state for the delete button
    setDeletingId(surveyIdToDelete);

    // OPTIMISTIC UPDATE: Step 1 - Save current state for rollback
    const previousSurveys = [...surveys];

    // OPTIMISTIC UPDATE: Step 2 - Update UI immediately (remove survey)
    setSurveys(surveys.filter((survey) => survey.id !== surveyIdToDelete));

    try {
      // OPTIMISTIC UPDATE: Step 3 - Make API call to delete from database
      // Note: CASCADE DELETE is configured in database migration
      // This will also delete related survey_questions and responses
      // Activity feed entry is automatically created via database trigger
      const { error: deleteError } = await supabase
        .from("surveys")
        .delete()
        .eq("id", surveyIdToDelete);

      if (deleteError) {
        logger.error('Supabase delete failed', deleteError, { surveyId: surveyIdToDelete });
        throw new Error(`Database error: ${deleteError.message} (Code: ${deleteError.code})`);
      }

      // OPTIMISTIC UPDATE: Step 4 - Success! Keep the optimistic update
      showToast("Survey deleted successfully", "success");
      
      logger.info('Survey deleted successfully', { 
        surveyId: surveyIdToDelete, 
        surveyTitle,
        remainingSurveys: surveys.length - 1
      });
      
      // Note: Dashboard stats will auto-update via Realtime subscription
      // Activity feed entry was created via database trigger
    } catch (err) {
      // OPTIMISTIC UPDATE: Step 5 - Failure! Rollback to previous state
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      
      logger.error('Failed to delete survey', err, { 
        surveyId: surveyIdToDelete,
        surveyTitle 
      });
      
      setSurveys(previousSurveys);
      showToast(`Failed to delete survey: ${errorMessage}`, "error");
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * Cancel deletion - close modal
   */
  const handleDeleteCancel = () => {
    setConfirmModal({ show: false, surveyId: null, surveyTitle: "" });
  };

  // ─────────────────────────────────────────────
  // TOAST HELPER
  // ─────────────────────────────────────────────
  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type, show: true });
  };

  const closeToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  // ─────────────────────────────────────────────
  // VERSION HISTORY HANDLER
  // ─────────────────────────────────────────────
  const handleViewHistory = (surveyId: string) => {
    const survey = surveys.find((s) => s.id === surveyId);
    if (!survey) return;

    setVersionHistoryModal({
      show: true,
      surveyId: surveyId,
      surveyTitle: survey.title,
    });
  };

  const handleCloseVersionHistory = () => {
    setVersionHistoryModal({ show: false, surveyId: null, surveyTitle: "" });
  };

  // ─────────────────────────────────────────────
  // VERSION FILTERING LOGIC
  // ─────────────────────────────────────────────
  
  /**
   * Determines if a survey is the latest in its version family
   * A survey is "latest" if no other survey has it as a parent_id
   */
  const isLatestVersion = (survey: Survey): boolean => {
    // Check if any other survey has this survey as its parent
    const hasChildVersion = surveys.some(s => s.parent_id === survey.id);
    return !hasChildVersion;
  };

  /**
   * Filter surveys based on showAllVersions toggle
   * - If false (default): Only show latest versions
   * - If true: Show all versions
   */
  const displayedSurveys = showAllVersions
    ? surveys
    : surveys.filter(survey => isLatestVersion(survey));

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
        {/* Version Filter Toggle */}
        {!loading && !error && surveys.length > 0 && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <p className="font-body text-sm text-slate-600">
                Showing <span className="font-semibold text-slate-900">{displayedSurveys.length}</span> of {surveys.length} surveys
              </p>
              <button
                onClick={() => setShowAllVersions(!showAllVersions)}
                className={`inline-flex items-center gap-2 px-4 py-2 font-accent text-sm font-medium rounded-lg transition-all duration-200 ${
                  showAllVersions
                    ? 'bg-[#2663EB] text-white hover:bg-[#2054C8]'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span className="text-base">{showAllVersions ? '📋' : '🔍'}</span>
                {showAllVersions ? 'Show Latest Only' : 'Show All Versions'}
              </button>
            </div>
            {!showAllVersions && displayedSurveys.length < surveys.length && (
              <p className="font-body text-xs text-slate-500">
                💡 {surveys.length - displayedSurveys.length} older version{surveys.length - displayedSurveys.length !== 1 ? 's' : ''} hidden
              </p>
            )}
          </div>
        )}

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
        {!loading && !error && displayedSurveys.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedSurveys.map((survey) => (
              <SurveyCard
                key={survey.id}
                survey={survey}
                copiedId={copiedId}
                deletingId={deletingId}
                onCopyLink={handleCopyLink}
                onDelete={handleDeleteClick}
                onViewHistory={handleViewHistory}
                isLatest={isLatestVersion(survey)}
              />
            ))}
          </div>
        )}

        {/* No Results After Filtering */}
        {!loading && !error && surveys.length > 0 && displayedSurveys.length === 0 && (
          <div className="text-center py-12">
            <p className="font-body text-base text-slate-600 mb-4">
              No latest versions found. All surveys have newer versions.
            </p>
            <button
              onClick={() => setShowAllVersions(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#2663EB] text-white font-accent text-sm font-medium rounded-lg hover:bg-[#2054C8] transition-colors duration-200"
            >
              Show All Versions
            </button>
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <ConfirmModal
          title="Delete Survey?"
          message={`Are you sure you want to delete "${confirmModal.surveyTitle}"? This will permanently delete the survey, all its questions, and all responses. This action cannot be undone.`}
          confirmLabel="Delete Survey"
          cancelLabel="Cancel"
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          isLoading={deletingId === confirmModal.surveyId}
        />
      )}

      {/* Version History Modal */}
      {versionHistoryModal.show && versionHistoryModal.surveyId && (
        <VersionHistoryModal
          surveyId={versionHistoryModal.surveyId}
          currentSurveyId={versionHistoryModal.surveyId}
          surveyTitle={versionHistoryModal.surveyTitle}
          onClose={handleCloseVersionHistory}
        />
      )}

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </div>
  );
}
