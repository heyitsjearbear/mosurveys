import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { formatVersion, getVersionHistory } from "@/lib/versionUtils";
import { ClockIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { createLogger } from "@/lib/logger";

const logger = createLogger('VersionHistory');

// ─────────────────────────────────────────────
// VersionHistory Component
// ─────────────────────────────────────────────
// Displays a timeline of all versions for a survey family.
// Shows version number, changelog, creation date, response count, and actions.

interface VersionHistoryProps {
  surveyId: string;
  currentSurveyId: string; // The survey being viewed
  onRestore?: (versionId: string) => void;
  onEdit?: (versionId: string) => void;
}

interface SurveyVersion {
  id: string;
  title: string;
  version: number;
  changelog: string | null;
  created_at: string;
  parent_id: string | null;
  response_count?: number;
}

export function VersionHistory({ surveyId, currentSurveyId, onRestore, onEdit }: VersionHistoryProps) {
  const [versions, setVersions] = useState<SurveyVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVersionHistory = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Step 1: Find the TRUE root by traversing up the parent chain
        let currentId = surveyId;
        let rootId = surveyId;
        const maxDepth = 100; // Safety limit to prevent infinite loops
        let depth = 0;

        while (depth < maxDepth) {
          const { data: survey, error: surveyError } = await supabase
            .from('surveys')
            .select('id, parent_id')
            .eq('id', currentId)
            .single();

          if (surveyError) throw new Error('Failed to fetch survey');

          if (!survey.parent_id) {
            // Found the root (no parent)
            rootId = survey.id;
            break;
          }

          // Move up to parent
          currentId = survey.parent_id;
          depth++;
        }

        logger.debug('Found root survey', { surveyId, rootId, depth });

        // Step 2: Fetch ALL surveys (we'll filter to the family tree in JavaScript)
        const { data: allSurveys, error: surveysError } = await supabase
          .from('surveys')
          .select(`
            id,
            title,
            version,
            changelog,
            created_at,
            parent_id
          `);

        if (surveysError) throw new Error('Failed to fetch version history');

        // Step 3: Recursively build the complete family tree
        const findAllDescendants = (parentId: string): typeof allSurveys => {
          const directChildren = allSurveys.filter(s => s.parent_id === parentId);
          let allDescendants = [...directChildren];

          // Recursively find children of children
          directChildren.forEach(child => {
            allDescendants = [...allDescendants, ...findAllDescendants(child.id)];
          });

          return allDescendants;
        };

        // Get the root survey
        const rootSurvey = allSurveys.find(s => s.id === rootId);
        if (!rootSurvey) throw new Error('Root survey not found');

        // Build complete family: root + all descendants (recursively)
        const familySurveys = [rootSurvey, ...findAllDescendants(rootId)];

        // Sort by version ascending
        const surveysData = familySurveys.sort((a, b) => a.version - b.version);

        // Fetch response counts for each version
        const versionIds = surveysData.map(s => s.id);
        const { data: responseCounts, error: responseError } = await supabase
          .from('responses')
          .select('survey_id')
          .in('survey_id', versionIds);

        if (responseError) {
          logger.warn('Failed to fetch response counts', responseError);
        }

        // Count responses per survey
        const responseCountMap: Record<string, number> = {};
        if (responseCounts) {
          responseCounts.forEach(r => {
            responseCountMap[r.survey_id] = (responseCountMap[r.survey_id] || 0) + 1;
          });
        }

        // Combine data
        const versionsWithCounts = surveysData.map(v => ({
          ...v,
          response_count: responseCountMap[v.id] || 0,
        }));

        setVersions(versionsWithCounts);
        logger.info('Version history loaded', { 
          surveyId, 
          versionCount: versionsWithCounts.length 
        });

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load version history';
        logger.error('Failed to fetch version history', err, { surveyId });
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVersionHistory();
  }, [surveyId]);

  // ─────────────────────────────────────────────
  // Loading State
  // ─────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-[#2663EB] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="font-body text-sm text-slate-600">Loading version history...</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Error State
  // ─────────────────────────────────────────────

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="font-body text-sm text-red-700">{error}</p>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Empty State
  // ─────────────────────────────────────────────

  if (versions.length === 0) {
    return (
      <div className="text-center py-8">
        <ClockIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="font-body text-base text-slate-600">No version history found</p>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Version Timeline
  // ─────────────────────────────────────────────

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <ClockIcon className="w-5 h-5 text-slate-500" />
        <h3 className="font-heading text-lg font-semibold text-slate-900">
          Version History ({versions.length})
        </h3>
      </div>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-slate-200" />

        {/* Version Items */}
        <div className="space-y-6">
          {versions.map((version, index) => {
            const isCurrentVersion = version.id === currentSurveyId;
            const isLatestVersion = index === versions.length - 1;

            return (
              <div
                key={version.id}
                className={`relative pl-12 ${
                  isCurrentVersion ? 'bg-blue-50 -ml-4 -mr-4 p-4 rounded-lg' : ''
                }`}
              >
                {/* Timeline Dot */}
                <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  isCurrentVersion
                    ? 'bg-[#2663EB] ring-4 ring-blue-100'
                    : isLatestVersion
                    ? 'bg-green-500 ring-4 ring-green-100'
                    : 'bg-slate-300'
                }`}>
                  {isCurrentVersion && (
                    <CheckCircleIcon className="w-5 h-5 text-white" />
                  )}
                  {!isCurrentVersion && (
                    <span className="font-accent text-xs font-semibold text-white">
                      {Math.round(version.version * 10) / 10}
                    </span>
                  )}
                </div>

                {/* Version Content */}
                <div>
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-heading text-lg font-semibold ${
                          isCurrentVersion ? 'text-[#2663EB]' : 'text-slate-900'
                        }`}>
                          {formatVersion(version.version)}
                        </span>
                        {isCurrentVersion && (
                          <span className="px-2 py-0.5 bg-[#2663EB] text-white font-accent text-xs font-medium rounded-full">
                            Current
                          </span>
                        )}
                        {isLatestVersion && !isCurrentVersion && (
                          <span className="px-2 py-0.5 bg-green-500 text-white font-accent text-xs font-medium rounded-full">
                            Latest
                          </span>
                        )}
                      </div>
                      <p className="font-body text-sm text-slate-600 mb-2">
                        {new Date(version.created_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                      {version.changelog && (
                        <p className="font-body text-sm text-slate-700 italic">
                          "{version.changelog}"
                        </p>
                      )}
                      {version.response_count !== undefined && version.response_count > 0 && (
                        <p className="font-accent text-xs text-slate-500 mt-1">
                          {version.response_count} {version.response_count === 1 ? 'response' : 'responses'}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(version.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 hover:bg-amber-200 font-accent text-xs font-medium rounded-lg transition-colors duration-200"
                        >
                          Edit
                        </button>
                      )}
                      {!isCurrentVersion && onRestore && (
                        <button
                          onClick={() => onRestore(version.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 font-accent text-xs font-medium rounded-lg transition-colors duration-200"
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

