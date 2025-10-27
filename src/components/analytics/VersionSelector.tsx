import type { Database } from "@/types/supabase";

// Minimal type for version selector (only fetch what we need)
type SurveyVersion = Pick<Database["public"]["Tables"]["surveys"]["Row"], 'id' | 'version'>;

interface VersionSelectorProps {
  versions: SurveyVersion[];
  selectedVersionId: string;
  onVersionChange: (versionId: string) => void;
}

/**
 * VersionSelector Component
 *
 * Displays available survey versions and allows switching between them.
 * Useful for comparing analytics across different iterations of a survey.
 *
 * @param versions - Array of survey versions
 * @param selectedVersionId - Currently selected version ID
 * @param onVersionChange - Callback when version selection changes
 */
export function VersionSelector({
  versions,
  selectedVersionId,
  onVersionChange,
}: VersionSelectorProps) {
  if (versions.length <= 1) return null;

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-sm font-semibold text-slate-900 mb-1">
            View Analytics by Version
          </h3>
          <p className="font-body text-xs text-slate-600">
            Compare responses across different survey versions
          </p>
        </div>
        <div className="flex items-center gap-2">
          {versions.map((version) => (
            <button
              key={version.id}
              onClick={() => onVersionChange(version.id)}
              className={`px-4 py-2 font-accent text-sm font-medium rounded-lg transition-all duration-200 ${
                selectedVersionId === version.id
                  ? 'bg-[#2663EB] text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              v{version.version}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
