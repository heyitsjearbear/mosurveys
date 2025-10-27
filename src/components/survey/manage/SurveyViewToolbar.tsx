import { ViewModeToggle, FilterControls } from "@/components/survey/manage";
import type { ViewMode, FilterState } from "@/components/survey/manage";

/**
 * SurveyViewToolbar Component
 * 
 * Toolbar with filters, view mode toggle, and version toggle
 * Separated from main page for cleaner code organization
 */

interface SurveyViewToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  showAllVersions: boolean;
  onShowAllVersionsChange: (show: boolean) => void;
  audienceOptions: string[];
  filteredCount: number;
  versionFilteredCount: number;
  totalCount: number;
}

export default function SurveyViewToolbar({
  viewMode,
  onViewModeChange,
  filters,
  onFilterChange,
  showAllVersions,
  onShowAllVersionsChange,
  audienceOptions,
  filteredCount,
  versionFilteredCount,
  totalCount,
}: SurveyViewToolbarProps) {
  return (
    <div className="space-y-4 mb-6">
      {/* Filter Controls */}
      <FilterControls
        filters={filters}
        onFilterChange={onFilterChange}
        audienceOptions={audienceOptions}
      />

      {/* View Mode Toggle and Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <ViewModeToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
          
          <div className="h-8 w-px bg-slate-300" />
          
          <button
            onClick={() => onShowAllVersionsChange(!showAllVersions)}
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
            Showing <span className="font-semibold text-slate-900">{filteredCount}</span> of {versionFilteredCount} surveys
          </p>
          {!showAllVersions && versionFilteredCount < totalCount && (
            <p className="font-body text-xs text-slate-500">
              💡 {totalCount - versionFilteredCount} older version{totalCount - versionFilteredCount !== 1 ? 's' : ''} hidden
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
