import type { QuestionType } from "@/types/survey";

// ─────────────────────────────────────────────
// Question Type Button Component
// ─────────────────────────────────────────────

interface QuestionTypeButtonProps {
  type: QuestionType;
  label: string;
  icon: string;
  onClick: () => void;
}

export function QuestionTypeButton({
  label,
  icon,
  onClick,
}: QuestionTypeButtonProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 hover:border-[#2663EB] font-accent text-sm font-medium text-slate-700 rounded-lg transition-all duration-200 active:scale-95"
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}

