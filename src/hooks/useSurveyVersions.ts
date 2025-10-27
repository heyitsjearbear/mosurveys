/**
 * useSurveyVersions Hook
 * ────────────────────────────────────────────────────
 * Manages survey version fetching and selection.
 * 
 * Why this hook exists:
 * - Centralizes version management logic
 * - Handles version fetching and selection state
 * - Reusable across analytics and edit pages
 * - Clean API for version-related operations
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { createLogger } from '@/lib/logger';
import type { Database } from '@/types/supabase';

const logger = createLogger('useSurveyVersions');

type Survey = Database['public']['Tables']['surveys']['Row'];
type SurveyVersion = Pick<Survey, 'id' | 'version' | 'title'>;

const DEFAULT_ORG_ID =
  process.env.NEXT_PUBLIC_DEFAULT_ORG_ID || '00000000-0000-0000-0000-000000000001';

/**
 * Hook Options
 */
interface UseSurveyVersionsOptions {
  /**
   * Organization ID to filter versions
   * @default DEFAULT_ORG_ID
   */
  orgId?: string;
  
  /**
   * Whether to fetch versions automatically
   * @default true
   */
  autoFetch?: boolean;
}

/**
 * Hook Return Type
 */
interface UseSurveyVersionsReturn {
  /**
   * All versions of the survey
   */
  versions: SurveyVersion[];
  
  /**
   * Currently selected version ID
   */
  selectedVersionId: string | null;
  
  /**
   * Currently selected version object
   */
  selectedVersion: SurveyVersion | null;
  
  /**
   * Loading state
   */
  loading: boolean;
  
  /**
   * Error message
   */
  error: string | null;
  
  /**
   * Set the selected version
   */
  setSelectedVersionId: (versionId: string) => void;
  
  /**
   * Refetch versions
   */
  refetch: () => Promise<void>;
}

/**
 * useSurveyVersions Hook
 * ────────────────────────────────────────────────────
 * Fetches all versions of a survey and manages version selection.
 * 
 * Features:
 * - Fetches all versions by survey title (versions share same title)
 * - Manages selected version state
 * - Auto-selects initial version
 * - Error handling
 * - Refetch capability
 * 
 * @param surveyId - Initial survey ID (used to find all versions)
 * @param surveyTitle - Survey title to find all versions
 * @param options - Configuration options
 * @returns Version data and state
 * 
 * @example
 * ```typescript
 * const { versions, selectedVersionId, setSelectedVersionId } = useSurveyVersions(
 *   surveyId,
 *   survey.title
 * );
 * 
 * return (
 *   <VersionSelector
 *     versions={versions}
 *     selectedVersionId={selectedVersionId}
 *     onVersionChange={setSelectedVersionId}
 *   />
 * );
 * ```
 */
export function useSurveyVersions(
  surveyId: string | undefined,
  surveyTitle: string | undefined,
  options: UseSurveyVersionsOptions = {}
): UseSurveyVersionsReturn {
  const { orgId = DEFAULT_ORG_ID, autoFetch = true } = options;

  const [versions, setVersions] = useState<SurveyVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(surveyId || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all versions of the survey
   */
  const fetchVersions = useCallback(async () => {
    if (!surveyTitle || !autoFetch) {
      logger.debug('Skipping version fetch', { surveyTitle, autoFetch });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      logger.info('Fetching survey versions', { surveyTitle, orgId });

      const { data, error: fetchError } = await supabase
        .from('surveys')
        .select('id, version, title')
        .eq('org_id', orgId)
        .ilike('title', surveyTitle)
        .order('version', { ascending: true });

      if (fetchError) throw fetchError;

      setVersions(data || []);

      logger.debug('Survey versions loaded', { 
        surveyTitle,
        versionCount: data?.length || 0 
      });
    } catch (err) {
      logger.error('Failed to fetch survey versions', err, { surveyTitle });
      setError('Failed to load survey versions');
    } finally {
      setLoading(false);
    }
  }, [surveyTitle, orgId, autoFetch]);

  // Initial fetch
  useEffect(() => {
    if (autoFetch) {
      fetchVersions();
    }
  }, [fetchVersions, autoFetch]);

  // Get currently selected version object
  const selectedVersion = versions.find((v) => v.id === selectedVersionId) || null;

  return {
    versions,
    selectedVersionId,
    selectedVersion,
    loading,
    error,
    setSelectedVersionId,
    refetch: fetchVersions,
  };
}

