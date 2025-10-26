import { XMarkIcon } from "@heroicons/react/24/outline";
import { VersionHistory } from "./VersionHistory";
import { useRouter } from "next/navigation";
import { useState } from "react";

// ─────────────────────────────────────────────
// VersionHistoryModal Component
// ─────────────────────────────────────────────
// Modal wrapper for VersionHistory component.
// Provides restore functionality and navigation to edit page.

interface VersionHistoryModalProps {
  surveyId: string;
  currentSurveyId: string;
  surveyTitle: string;
  onClose: () => void;
}

export function VersionHistoryModal({
  surveyId,
  currentSurveyId,
  surveyTitle,
  onClose,
}: VersionHistoryModalProps) {
  const router = useRouter();
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  const handleRestore = async (versionId: string) => {
    if (!confirm('Are you sure you want to restore this version? This will create a new version with the old content.')) {
      return;
    }

    setIsRestoring(true);
    setRestoreError(null);

    try {
      // Get org ID from environment
      const DEFAULT_ORG_ID = process.env.NEXT_PUBLIC_DEFAULT_ORG_ID || '00000000-0000-0000-0000-000000000001';

      const response = await fetch('/api/surveys/restore-version', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldSurveyId: versionId,
          currentLatestSurveyId: currentSurveyId,
          orgId: DEFAULT_ORG_ID,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Close modal and reload page to show new version
        onClose();
        window.location.reload();
      } else {
        setRestoreError(data.error || 'Failed to restore version');
      }
    } catch (error) {
      setRestoreError('Failed to restore version. Please try again.');
      console.error('Restore error:', error);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleEdit = (versionId: string) => {
    router.push(`/mojeremiah/edit/${versionId}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-xl font-semibold text-slate-900">
                Version History
              </h2>
              <p className="font-body text-sm text-slate-600 mt-1">
                {surveyTitle}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-200"
              title="Close"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 overflow-y-auto max-h-[calc(80vh-120px)]">
            {restoreError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="font-body text-sm text-red-700">{restoreError}</p>
              </div>
            )}

            {isRestoring && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-[#2663EB] border-t-transparent rounded-full animate-spin" />
                  <p className="font-body text-sm text-slate-700">Restoring version...</p>
                </div>
              </div>
            )}

            <VersionHistory
              surveyId={surveyId}
              currentSurveyId={currentSurveyId}
              onRestore={handleRestore}
              onEdit={handleEdit}
            />
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <p className="font-body text-xs text-slate-600">
                💡 <span className="font-medium">Tip:</span> Restoring a version creates a new version with the old content, preserving all history.
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 font-accent text-sm font-medium rounded-lg transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

