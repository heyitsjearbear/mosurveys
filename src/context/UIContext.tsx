"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { ViewMode, FilterState } from "@/components/survey/manage";

/**
 * UIContext
 * 
 * Manages application-wide UI preferences and persists them across sessions.
 * 
 * Features:
 * - Persists view mode (grid, table, list)
 * - Persists filter state (search, audience, date range)
 * - Saves to localStorage for persistence across refreshes
 * - Hydrates on mount to prevent hydration mismatch
 */

interface UIContextType {
  // View preferences
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  
  // Filter preferences
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  
  // Show all versions toggle
  showAllVersions: boolean;
  setShowAllVersions: (show: boolean) => void;
  
  // Hydration state
  isHydrated: boolean;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

// Storage keys
const STORAGE_KEYS = {
  VIEW_MODE: "mosurveys_view_mode",
  FILTERS: "mosurveys_filters",
  SHOW_ALL_VERSIONS: "mosurveys_show_all_versions",
} as const;

// Default values
const DEFAULT_VIEW_MODE: ViewMode = "grid";
const DEFAULT_FILTERS: FilterState = {
  audience: "all",
  dateRange: "all",
  searchQuery: "",
};
const DEFAULT_SHOW_ALL_VERSIONS = false;

/**
 * UIProvider Component
 * 
 * Wraps the application to provide UI context and manage persistence
 */
export function UIProvider({ children }: { children: ReactNode }) {
  // State
  const [viewMode, setViewModeState] = useState<ViewMode>(DEFAULT_VIEW_MODE);
  const [filters, setFiltersState] = useState<FilterState>(DEFAULT_FILTERS);
  const [showAllVersions, setShowAllVersionsState] = useState(DEFAULT_SHOW_ALL_VERSIONS);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      // Get stored values
      const storedViewMode = localStorage.getItem(STORAGE_KEYS.VIEW_MODE) as ViewMode | null;
      const storedFilters = localStorage.getItem(STORAGE_KEYS.FILTERS);
      const storedShowAllVersions = localStorage.getItem(STORAGE_KEYS.SHOW_ALL_VERSIONS);

      // Restore view mode
      if (storedViewMode && ["grid", "table", "list"].includes(storedViewMode)) {
        setViewModeState(storedViewMode);
      }

      // Restore filters
      if (storedFilters) {
        try {
          const parsedFilters = JSON.parse(storedFilters);
          // Validate filter structure
          if (
            parsedFilters.audience !== undefined &&
            parsedFilters.dateRange !== undefined &&
            parsedFilters.searchQuery !== undefined
          ) {
            setFiltersState(parsedFilters);
          }
        } catch (e) {
          console.error("Failed to parse stored filters", e);
        }
      }

      // Restore show all versions
      if (storedShowAllVersions) {
        setShowAllVersionsState(storedShowAllVersions === "true");
      }
    } catch (error) {
      console.error("Failed to hydrate UI preferences from localStorage", error);
    }

    setIsHydrated(true);
  }, []);

  // Persist view mode to localStorage
  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEYS.VIEW_MODE, mode);
    } catch (error) {
      console.error("Failed to save view mode to localStorage", error);
    }
  };

  // Persist filters to localStorage
  const setFilters = (newFilters: FilterState) => {
    setFiltersState(newFilters);
    try {
      localStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(newFilters));
    } catch (error) {
      console.error("Failed to save filters to localStorage", error);
    }
  };

  // Persist show all versions to localStorage
  const setShowAllVersions = (show: boolean) => {
    setShowAllVersionsState(show);
    try {
      localStorage.setItem(STORAGE_KEYS.SHOW_ALL_VERSIONS, show.toString());
    } catch (error) {
      console.error("Failed to save show all versions preference to localStorage", error);
    }
  };

  const value: UIContextType = {
    viewMode,
    setViewMode,
    filters,
    setFilters,
    showAllVersions,
    setShowAllVersions,
    isHydrated,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

/**
 * useUI Hook
 * 
 * Custom hook to access UI context throughout the application
 * 
 * Usage:
 * ```tsx
 * const { viewMode, setViewMode, filters, setFilters } = useUI();
 * ```
 */
export function useUI(): UIContextType {
  const context = useContext(UIContext);

  if (!context) {
    throw new Error("useUI must be used within a UIProvider");
  }

  return context;
}

export default UIContext;
