import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";

interface ExportActionsProps {
  onExportCSV: () => void;
  onExportJSON: () => void;
  disabled?: boolean;
}

/**
 * ExportActions Component
 *
 * Provides buttons to export analytics data in CSV and JSON formats.
 * Ideal for allowing users to download survey responses for external analysis.
 *
 * @param onExportCSV - Callback function when CSV export is clicked
 * @param onExportJSON - Callback function when JSON export is clicked
 * @param disabled - If true, disables export buttons (e.g., no data available)
 */
export function ExportActions({
  onExportCSV,
  onExportJSON,
  disabled = false,
}: ExportActionsProps) {
  return (
    <div className="flex items-center justify-between bg-white rounded-lg border border-slate-200 shadow-sm p-4">
      <div>
        <h3 className="font-heading text-sm font-semibold text-slate-900">
          Export Analytics
        </h3>
        <p className="font-body text-xs text-slate-600 mt-0.5">
          Download response data for external analysis
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onExportCSV}
          disabled={disabled}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-accent text-sm font-medium rounded-lg transition-colors duration-200"
        >
          <ArrowDownTrayIcon className="w-4 h-4" />
          CSV
        </button>
        <button
          onClick={onExportJSON}
          disabled={disabled}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-accent text-sm font-medium rounded-lg transition-colors duration-200"
        >
          <ArrowDownTrayIcon className="w-4 h-4" />
          JSON
        </button>
      </div>
    </div>
  );
}
