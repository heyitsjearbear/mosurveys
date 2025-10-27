"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ClipboardDocumentListIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { supabase } from "@/lib/supabaseClient";
import { createLogger } from "@/lib/logger";
import { useUI } from "@/context";
import type { Database } from "@/types/supabase";
import { LoadingState, ErrorState, EmptyState, Toast, ConfirmModal } from "@/components/common";
import { PageHeader } from "@/components/layout";
import {
  SurveyCard,
  SurveyTableRow,
  SurveyListItem,
  ViewModeToggle,
  FilterControls,
  QuestionsPreviewModal,
  VersionHistoryModal,
} from "@/components/survey/manage";
import type { ToastType } from "@/components/common/Toast";

const logger = createLogger('SurveyView');

type Survey = Database["public"]["Tables"]["surveys"]["Row"];

// ─────────────────────────────────────────────
// Survey Management Page
// ─────────────────────────────────────────────
// Displays all surveys with filtering, sorting, and management actions
//
// Features:
// - Multiple view modes (grid, table, list)
// - Advanced filtering (search, audience, date range)
// - Optimistic updates for instant UI feedback
// - Custom confirmation modal for deletions
// - Toast notifications for success/error states
// - Cascade deletion (surveys, questions, responses)
// - Loading states during operations
// - Questions preview modal

// Get default org ID from environment or use fallback
const DEFAULT_ORG_ID = process.env.NEXT_PUBLIC_DEFAULT_ORG_ID || '00000000-0000-0000-0000-000000000001';

interface ToastState {
  message: string;
  type: ToastType;
  show: boolean;
}

export default function SurveyViewPage() {
  // Get UI preferences from context
  const { viewMode, setViewMode, filters, setFilters, showAllVersions, setShowAllVersions, isHydrated } = useUI();

  // Survey data state
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>({ message: "", type: "success", show: false });
  
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

  // Questions preview modal state
  const [questionsModal, setQuestionsModal] = useState<{
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
  // FILTERING LOGIC
  // ─────────────────────────────────────────────
  
  /**
   * Get unique audience options from all surveys
   */
  const audienceOptions = useMemo(() => {
    const audiences = surveys
      .map(s => s.audience)
      .filter((a): a is string => !!a);
    return Array.from(new Set(audiences)).sort();
  }, [surveys]);

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
   * Filter surveys based on version toggle
   */
  const versionFilteredSurveys = useMemo(() => {
    return showAllVersions
      ? surveys
      : surveys.filter(survey => isLatestVersion(survey));
  }, [surveys, showAllVersions]);

  /**
   * Apply all filters to surveys
   */
  const filteredSurveys = useMemo(() => {
    let filtered = versionFilteredSurveys;

    // Search filter
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(query) ||
        s.audience?.toLowerCase().includes(query) ||
        s.description?.toLowerCase().includes(query)
      );
    }

    // Audience filter
    if (filters.audience !== "all") {
      filtered = filtered.filter(s => s.audience === filters.audience);
    }

    // Date range filter
    if (filters.dateRange !== "all") {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (filters.dateRange) {
        case "7days":
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case "30days":
          cutoffDate.setDate(now.getDate() - 30);
          break;
        case "90days":
          cutoffDate.setDate(now.getDate() - 90);
          break;
      }
      
      filtered = filtered.filter(s => new Date(s.created_at) >= cutoffDate);
    }

    return filtered;
  }, [versionFilteredSurveys, filters]);

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
  // QUESTIONS PREVIEW HANDLER
  // ─────────────────────────────────────────────
  const handleViewQuestions = (surveyId: string) => {
    const survey = surveys.find((s) => s.id === surveyId);
    if (!survey) return;

    setQuestionsModal({
      show: true,
      surveyId: surveyId,
      surveyTitle: survey.title,
    });
  };

  const handleCloseQuestions = () => {
    setQuestionsModal({ show: false, surveyId: null, surveyTitle: "" });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Controls */}
        {!loading && !error && surveys.length > 0 && isHydrated && (
          <div className="space-y-4 mb-6">
            {/* Filter Controls */}
            <FilterControls
              filters={filters}
              onFilterChange={setFilters}
              audienceOptions={audienceOptions}
            />

            {/* View Mode Toggle and Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
                
                <div className="h-8 w-px bg-slate-300" />
                
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

              <div className="flex items-center gap-3">
                <p className="font-body text-sm text-slate-600">
                  Showing <span className="font-semibold text-slate-900">{filteredSurveys.length}</span> of {versionFilteredSurveys.length} surveys
                </p>
                {!showAllVersions && versionFilteredSurveys.length < surveys.length && (
                  <p className="font-body text-xs text-slate-500">
                    💡 {surveys.length - versionFilteredSurveys.length} older version{surveys.length - versionFilteredSurveys.length !== 1 ? 's' : ''} hidden
                  </p>
                )}
              </div>
            </div>
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

        {/* No Results After Filtering */}
        {!loading && !error && surveys.length > 0 && filteredSurveys.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
            <p className="font-body text-base text-slate-600 mb-4">
              No surveys match your filters.
            </p>
            <button
              onClick={() => setFilters({ audience: "all", dateRange: "all", searchQuery: "" })}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#2663EB] text-white font-accent text-sm font-medium rounded-lg hover:bg-[#2054C8] transition-colors duration-200"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Grid View */}
        {!loading && !error && filteredSurveys.length > 0 && viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSurveys.map((survey) => (
              <SurveyCard
                key={survey.id}
                survey={survey}
                copiedId={copiedId}
                deletingId={deletingId}
                onCopyLink={handleCopyLink}
                onDelete={handleDeleteClick}
                onViewHistory={handleViewHistory}
                onViewQuestions={handleViewQuestions}
                isLatest={isLatestVersion(survey)}
              />
            ))}
          </div>
        )}

        {/* Table View */}
        {!loading && !error && filteredSurveys.length > 0 && viewMode === "table" && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left font-heading text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Survey
                  </th>
                  <th className="px-4 py-3 text-left font-heading text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Version
                  </th>
                  <th className="px-4 py-3 text-left font-heading text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Responses
                  </th>
                  <th className="px-4 py-3 text-left font-heading text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left font-heading text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSurveys.map((survey) => (
                  <SurveyTableRow
                    key={survey.id}
                    survey={survey}
                    copiedId={copiedId}
                    deletingId={deletingId}
                    onCopyLink={handleCopyLink}
                    onDelete={handleDeleteClick}
                    onViewHistory={handleViewHistory}
                    onViewQuestions={handleViewQuestions}
                    isLatest={isLatestVersion(survey)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* List View */}
        {!loading && !error && filteredSurveys.length > 0 && viewMode === "list" && (
          <div className="space-y-4">
            {filteredSurveys.map((survey) => (
              <SurveyListItem
                key={survey.id}
                survey={survey}
                copiedId={copiedId}
                deletingId={deletingId}
                onCopyLink={handleCopyLink}
                onDelete={handleDeleteClick}
                onViewHistory={handleViewHistory}
                onViewQuestions={handleViewQuestions}
                isLatest={isLatestVersion(survey)}
              />
            ))}
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

      {/* Questions Preview Modal */}
      {questionsModal.show && questionsModal.surveyId && (
        <QuestionsPreviewModal
          surveyId={questionsModal.surveyId}
          surveyTitle={questionsModal.surveyTitle}
          onClose={handleCloseQuestions}
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
