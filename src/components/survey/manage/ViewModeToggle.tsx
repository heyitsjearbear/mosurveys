import { Squares2X2Icon, TableCellsIcon, ListBulletIcon } from "@heroicons/react/24/outline";

/**
 * ViewModeToggle Component
 * 
 * Toggles between different view modes for surveys: grid, table, and list
 * 
 * Features:
 * - Three view modes with icons
 * - Active state highlighting
 * - Smooth transitions
 */

export type ViewMode = "grid" | "table" | "list";

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export default function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
  const modes: { value: ViewMode; icon: typeof Squares2X2Icon; label: string }[] = [
    { value: "grid", icon: Squares2X2Icon, label: "Grid" },
    { value: "table", icon: TableCellsIcon, label: "Table" },
    { value: "list", icon: ListBulletIcon, label: "List" },
  ];

  return (
    <div className="inline-flex items-center bg-slate-100 rounded-lg p-1 gap-1">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = viewMode === mode.value;
        
        return (
          <button
            key={mode.value}
            onClick={() => onViewModeChange(mode.value)}
            className={`inline-flex items-center gap-2 px-3 py-2 font-accent text-sm font-medium rounded-md transition-all duration-200 ${
              isActive
                ? "bg-white text-[#2663EB] shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
            title={`${mode.label} view`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
}

