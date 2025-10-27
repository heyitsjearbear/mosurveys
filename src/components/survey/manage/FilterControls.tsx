import { FunnelIcon, XMarkIcon } from "@heroicons/react/24/outline";

/**
 * FilterControls Component
 * 
 * Provides filtering options for surveys
 * 
 * Features:
 * - Filter by audience
 * - Filter by date range (last 7 days, 30 days, all time)
 * - Clear all filters
 */

export interface FilterState {
  audience: string;
  dateRange: "all" | "7days" | "30days" | "90days";
  searchQuery: string;
}

interface FilterControlsProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  audienceOptions: string[];
}

export default function FilterControls({
  filters,
  onFilterChange,
  audienceOptions,
}: FilterControlsProps) {
  const hasActiveFilters = filters.audience !== "all" || filters.dateRange !== "all" || filters.searchQuery !== "";

  const handleClearFilters = () => {
    onFilterChange({
      audience: "all",
      dateRange: "all",
      searchQuery: "",
    });
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-5 h-5 text-slate-600" />
          <h3 className="font-heading text-sm font-semibold text-slate-900">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-accent font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors duration-200"
          >
            <XMarkIcon className="w-3.5 h-3.5" />
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Input */}
        <div>
          <label htmlFor="search" className="block font-body text-xs font-medium text-slate-700 mb-1">
            Search
          </label>
          <input
            id="search"
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            placeholder="Search surveys..."
            className="w-full px-3 py-2 font-body text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2663EB] focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Audience Filter */}
        <div>
          <label htmlFor="audience" className="block font-body text-xs font-medium text-slate-700 mb-1">
            Audience
          </label>
          <select
            id="audience"
            value={filters.audience}
            onChange={(e) => onFilterChange({ ...filters, audience: e.target.value })}
            className="w-full px-3 py-2 font-body text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2663EB] focus:border-transparent transition-all duration-200"
          >
            <option value="all">All Audiences</option>
            {audienceOptions.map((audience) => (
              <option key={audience} value={audience}>
                {audience}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Filter */}
        <div>
          <label htmlFor="dateRange" className="block font-body text-xs font-medium text-slate-700 mb-1">
            Date Range
          </label>
          <select
            id="dateRange"
            value={filters.dateRange}
            onChange={(e) => onFilterChange({ ...filters, dateRange: e.target.value as FilterState["dateRange"] })}
            className="w-full px-3 py-2 font-body text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2663EB] focus:border-transparent transition-all duration-200"
          >
            <option value="all">All Time</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>
        </div>

        {/* Filter Status */}
        <div className="flex items-end">
          <div className="w-full px-3 py-2 bg-slate-50 rounded-lg">
            <p className="font-body text-xs text-slate-600">
              {hasActiveFilters ? (
                <span className="text-[#2663EB] font-medium">Filters active</span>
              ) : (
                <span className="text-slate-500">No filters applied</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

