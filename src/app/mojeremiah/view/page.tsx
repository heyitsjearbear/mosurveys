"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { createLogger } from "@/lib/logger";
import { useUI } from "@/context";
import type { Database } from "@/types/supabase";
import { Toast, ConfirmModal } from "@/components/common";
import {
  SurveyViewHeader,
  SurveyViewToolbar,
  SurveyViewContent,
  QuestionsPreviewModal,
  VersionHistoryModal,
} from "@/components/survey/manage";
import type { ToastType } from "@/components/common/Toast";

const logger = createLogger('SurveyView');

type Survey = Database["public"]["Tables"]["surveys"]["Row"];

const DEFAULT_ORG_ID = process.env.NEXT_PUBLIC_DEFAULT_ORG_ID || '00000000-0000-0000-0000-000000000001';

interface ToastState {
  message: string;
  type: ToastType;
  show: boolean;
}

interface ModalState {
  show: boolean;
  surveyId: string | null;
  surveyTitle: string;
}

/**
 * Survey Management Page
 * 
 * Main page for managing surveys with filtering, multiple view modes,
 * and survey actions (copy, delete, analytics, etc)
 */
export default function SurveyViewPage() {
  const { viewMode, setViewMode, filters, setFilters, showAllVersions, setShowAllVersions, isHydrated } = useUI();

  // Survey data state
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>({ message: "", type: "success", show: false });
  
  // Modal states
  const [confirmModal, setConfirmModal] = useState<ModalState>({ show: false, surveyId: null, surveyTitle: "" });
  const [versionHistoryModal, setVersionHistoryModal] = useState<ModalState>({ show: false, surveyId: null, surveyTitle: "" });
  const [questionsModal, setQuestionsModal] = useState<ModalState>({ show: false, surveyId: null, surveyTitle: "" });

  // Fetch surveys on mount
  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: surveysData, error: fetchError } = await supabase
        .from("surveys")
        .select("*")
        .eq("org_id", DEFAULT_ORG_ID)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      // Fetch response counts
      if (surveysData && surveysData.length > 0) {
        const surveyIds = surveysData.map(s => s.id);
        const { data: responseCounts, error: countError } = await supabase
          .from("responses")
          .select("survey_id")
          .in("survey_id", surveyIds);

        if (!countError && responseCounts) {
          const countsMap = responseCounts.reduce((acc, r) => {
            acc[r.survey_id] = (acc[r.survey_id] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

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

  // Get unique audiences for filter dropdown
  const audienceOptions = useMemo(() => {
    const audiences = surveys
      .map(s => s.audience)
      .filter((a): a is string => !!a);
    return Array.from(new Set(audiences)).sort();
  }, [surveys]);

  // Check if survey is latest version
  const isLatestVersion = (survey: Survey): boolean => {
    return !surveys.some(s => s.parent_id === survey.id);
  };

  // Filter surveys by version
  const versionFilteredSurveys = useMemo(() => {
    return showAllVersions ? surveys : surveys.filter(survey => isLatestVersion(survey));
  }, [surveys, showAllVersions]);

  // Filter surveys by search, audience, date
  const filteredSurveys = useMemo(() => {
    let filtered = versionFilteredSurveys;

    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(query) ||
        s.audience?.toLowerCase().includes(query) ||
        s.description?.toLowerCase().includes(query)
      );
    }

    if (filters.audience !== "all") {
      filtered = filtered.filter(s => s.audience === filters.audience);
    }

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

  // Handlers
  const handleCopyLink = (surveyId: string) => {
    const link = `${window.location.origin}/mojeremiah/respond/${surveyId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(surveyId);
    showToast("Link copied to clipboard!", "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteClick = (surveyId: string) => {
    const survey = surveys.find((s) => s.id === surveyId);
    if (!survey) return;
    setConfirmModal({ show: true, surveyId, surveyTitle: survey.title });
  };

  const handleDeleteConfirm = async () => {
    const surveyIdToDelete = confirmModal.surveyId;
    if (!surveyIdToDelete) return;

    setConfirmModal({ show: false, surveyId: null, surveyTitle: "" });
    setDeletingId(surveyIdToDelete);

    const previousSurveys = [...surveys];
    setSurveys(surveys.filter((survey) => survey.id !== surveyIdToDelete));

    try {
      const { error: deleteError } = await supabase
        .from("surveys")
        .delete()
        .eq("id", surveyIdToDelete);

      if (deleteError) throw deleteError;

      showToast("Survey deleted successfully", "success");
      logger.info('Survey deleted successfully', { surveyId: surveyIdToDelete });
    } catch (err) {
      setSurveys(previousSurveys);
      showToast("Failed to delete survey", "error");
      logger.error('Failed to delete survey', err, { surveyId: surveyIdToDelete });
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewHistory = (surveyId: string) => {
    const survey = surveys.find((s) => s.id === surveyId);
    if (!survey) return;
    setVersionHistoryModal({ show: true, surveyId, surveyTitle: survey.title });
  };

  const handleViewQuestions = (surveyId: string) => {
    const survey = surveys.find((s) => s.id === surveyId);
    if (!survey) return;
    setQuestionsModal({ show: true, surveyId, surveyTitle: survey.title });
  };

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type, show: true });
  };

  if (!isHydrated) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <SurveyViewHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar with filters and view mode */}
        {surveys.length > 0 && (
          <SurveyViewToolbar
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            filters={filters}
            onFilterChange={setFilters}
            showAllVersions={showAllVersions}
            onShowAllVersionsChange={setShowAllVersions}
            audienceOptions={audienceOptions}
            filteredCount={filteredSurveys.length}
            versionFilteredCount={versionFilteredSurveys.length}
            totalCount={surveys.length}
          />
        )}

        {/* No results after filtering */}
        {surveys.length > 0 && filteredSurveys.length === 0 && (
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

        {/* Survey content (handles loading, error, empty, and all view modes) */}
        {filteredSurveys.length > 0 && (
          <SurveyViewContent
            viewMode={viewMode}
            surveys={filteredSurveys}
            loading={loading}
            error={error}
            copiedId={copiedId}
            deletingId={deletingId}
            onCopyLink={handleCopyLink}
            onDelete={handleDeleteClick}
            onViewHistory={handleViewHistory}
            onViewQuestions={handleViewQuestions}
            onRetry={fetchSurveys}
            isLatestVersion={isLatestVersion}
          />
        )}

        {/* Fallback for initial load when surveys is empty */}
        {surveys.length === 0 && (
          <SurveyViewContent
            viewMode={viewMode}
            surveys={surveys}
            loading={loading}
            error={error}
            copiedId={copiedId}
            deletingId={deletingId}
            onCopyLink={handleCopyLink}
            onDelete={handleDeleteClick}
            onViewHistory={handleViewHistory}
            onViewQuestions={handleViewQuestions}
            onRetry={fetchSurveys}
            isLatestVersion={isLatestVersion}
          />
        )}
      </main>

      {/* Modals */}
      {confirmModal.show && (
        <ConfirmModal
          title="Delete Survey?"
          message={`Are you sure you want to delete "${confirmModal.surveyTitle}"? This action cannot be undone.`}
          confirmLabel="Delete Survey"
          cancelLabel="Cancel"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmModal({ show: false, surveyId: null, surveyTitle: "" })}
          isLoading={deletingId === confirmModal.surveyId}
        />
      )}

      {versionHistoryModal.show && versionHistoryModal.surveyId && (
        <VersionHistoryModal
          surveyId={versionHistoryModal.surveyId}
          currentSurveyId={versionHistoryModal.surveyId}
          surveyTitle={versionHistoryModal.surveyTitle}
          onClose={() => setVersionHistoryModal({ show: false, surveyId: null, surveyTitle: "" })}
        />
      )}

      {questionsModal.show && questionsModal.surveyId && (
        <QuestionsPreviewModal
          surveyId={questionsModal.surveyId}
          surveyTitle={questionsModal.surveyTitle}
          onClose={() => setQuestionsModal({ show: false, surveyId: null, surveyTitle: "" })}
        />
      )}

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
        />
      )}
    </div>
  );
}
