/**
 * Version Calculation Utilities for Hierarchical Survey Versioning
 * 
 * Purpose: Provides utility functions for managing survey version numbers
 * in a hierarchical versioning system (v1.0 → v1.1 → v1.2 → v2.0)
 * 
 * Version Format: X.Y where:
 * - X = Major version (integer)
 * - Y = Minor version (0-9)
 * - Stored as numeric: 1.2 means v1.2
 * 
 * Examples:
 * - v1.0 (original) → Edit → v1.1
 * - v1.1 → Edit → v1.2
 * - v1.9 → Edit → v2.0 (auto-promote to major)
 * - v1.x → Edit + "Mark as Major" → v2.0
 */

export interface ParsedVersion {
  major: number;
  minor: number;
}

export interface Survey {
  id: string;
  parent_id: string | null;
  version: number;
  title: string;
  created_at: string;
  [key: string]: any; // Allow additional properties
}

/**
 * Parses a numeric version into major and minor components
 * 
 * @param version - The numeric version (e.g., 1.2)
 * @returns Object with major and minor version numbers
 * 
 * @example
 * parseVersion(1.2) // { major: 1, minor: 2 }
 * parseVersion(2.0) // { major: 2, minor: 0 }
 * parseVersion(3.5) // { major: 3, minor: 5 }
 */
export function parseVersion(version: number): ParsedVersion {
  const major = Math.floor(version);
  
  // Extract minor version (handle floating point precision)
  // e.g., 1.2 → (1.2 - 1) * 10 = 2
  const minor = Math.round((version - major) * 10);
  
  return { major, minor };
}

/**
 * Calculates the next version number based on current version and whether
 * it should be a major version increment
 * 
 * Logic:
 * - Minor increment: v1.0 → v1.1, v1.1 → v1.2, etc.
 * - Major increment: v1.x → v2.0, v2.x → v3.0
 * - Auto-promote: v1.9 → v2.0 (minor overflow)
 * 
 * @param currentVersion - The current version number (e.g., 1.2)
 * @param isMajor - Whether to increment major version (default: false)
 * @returns The next version number
 * 
 * @example
 * calculateNextVersion(1.0, false) // 1.1
 * calculateNextVersion(1.2, false) // 1.3
 * calculateNextVersion(1.9, false) // 2.0 (auto-promote)
 * calculateNextVersion(1.5, true)  // 2.0 (manual major)
 * calculateNextVersion(2.0, true)  // 3.0
 */
export function calculateNextVersion(
  currentVersion: number,
  isMajor: boolean = false
): number {
  const { major, minor } = parseVersion(currentVersion);
  
  // If user explicitly marks as major version, bump major
  if (isMajor) {
    return major + 1.0;
  }
  
  // Otherwise, increment minor version
  const nextMinor = minor + 1;
  
  // If minor version reaches 10, auto-promote to next major
  if (nextMinor >= 10) {
    return major + 1.0;
  }
  
  // Calculate next version: major + (minor / 10)
  // e.g., major=1, nextMinor=2 → 1 + 0.2 = 1.2
  const nextVersion = major + (nextMinor / 10);
  
  // Round to 1 decimal place to avoid floating point issues
  return Math.round(nextVersion * 10) / 10;
}

/**
 * Finds the latest version in a survey family by checking all versions
 * that share the same root parent
 * 
 * Strategy:
 * 1. Find the root survey (no parent_id) or use parentId parameter
 * 2. Fetch all surveys with that parent_id
 * 3. Return the one with the highest version number
 * 
 * @param surveys - Array of surveys to search
 * @param parentId - The parent survey ID to find versions for
 * @returns The survey with the highest version number, or null if not found
 * 
 * @example
 * // Given surveys: v1.0, v1.1, v1.2 (all with parent_id = "abc123")
 * findLatestVersion(surveys, "abc123") // Returns v1.2 survey
 */
export function findLatestVersion(
  surveys: Survey[],
  parentId: string
): Survey | null {
  // Filter surveys that belong to this version family
  const familySurveys = surveys.filter(
    (survey) => survey.parent_id === parentId || survey.id === parentId
  );
  
  if (familySurveys.length === 0) {
    return null;
  }
  
  // Sort by version descending and return the highest
  const sorted = familySurveys.sort((a, b) => b.version - a.version);
  return sorted[0];
}

/**
 * Groups surveys by major version (v1.x, v2.x, v3.x)
 * 
 * Used for displaying version history in a hierarchical tree view
 * where each major version can be expanded/collapsed
 * 
 * @param surveys - Array of surveys to group
 * @param majorVersion - The major version to filter by (optional)
 * @returns Array of surveys matching the major version
 * 
 * @example
 * // Given: v1.0, v1.1, v1.2, v2.0, v2.1
 * getVersionFamily(surveys, 1) // Returns [v1.0, v1.1, v1.2]
 * getVersionFamily(surveys, 2) // Returns [v2.0, v2.1]
 */
export function getVersionFamily(
  surveys: Survey[],
  majorVersion?: number
): Survey[] {
  if (majorVersion === undefined) {
    return surveys;
  }
  
  return surveys.filter((survey) => {
    const { major } = parseVersion(survey.version);
    return major === majorVersion;
  });
}

/**
 * Determines if a version is the latest in its family
 * 
 * @param survey - The survey to check
 * @param allSurveys - All surveys in the family
 * @returns True if this is the latest version
 * 
 * @example
 * isLatestVersion(v1_2, [v1_0, v1_1, v1_2]) // true
 * isLatestVersion(v1_1, [v1_0, v1_1, v1_2]) // false
 */
export function isLatestVersion(survey: Survey, allSurveys: Survey[]): boolean {
  const rootId = survey.parent_id || survey.id;
  const latest = findLatestVersion(allSurveys, rootId);
  
  return latest?.id === survey.id;
}

/**
 * Builds a version lineage string for display
 * 
 * @param version - The numeric version
 * @returns Formatted version string (e.g., "v1.2")
 * 
 * @example
 * formatVersion(1.0) // "v1.0"
 * formatVersion(2.3) // "v2.3"
 */
export function formatVersion(version: number): string {
  return `v${version.toFixed(1)}`;
}

/**
 * Gets all versions in a survey's history (including the survey itself)
 * 
 * @param surveyId - The survey ID to get history for
 * @param allSurveys - All surveys to search through
 * @returns Array of surveys in version order (oldest to newest)
 * 
 * @example
 * // Given: v1.0 (id: A), v1.1 (parent: A), v1.2 (parent: A)
 * getVersionHistory("A", allSurveys) // [v1.0, v1.1, v1.2]
 */
export function getVersionHistory(
  surveyId: string,
  allSurveys: Survey[]
): Survey[] {
  // Find the root survey
  const survey = allSurveys.find((s) => s.id === surveyId);
  if (!survey) return [];
  
  const rootId = survey.parent_id || survey.id;
  
  // Get all surveys with this root as parent (including the root itself)
  const history = allSurveys.filter(
    (s) => s.id === rootId || s.parent_id === rootId
  );
  
  // Sort by version ascending (oldest to newest)
  return history.sort((a, b) => a.version - b.version);
}

/**
 * Validates a version number
 * 
 * @param version - The version to validate
 * @returns True if valid, false otherwise
 * 
 * @example
 * isValidVersion(1.0) // true
 * isValidVersion(1.5) // true
 * isValidVersion(-1) // false
 * isValidVersion(1.99) // false (minor can't exceed 9)
 */
export function isValidVersion(version: number): boolean {
  if (version < 1.0) return false;
  
  const { minor } = parseVersion(version);
  
  // Minor version must be 0-9
  return minor >= 0 && minor <= 9;
}

