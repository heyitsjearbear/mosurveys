import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

// ─────────────────────────────────────────────
// Navigation Buttons Component
// ─────────────────────────────────────────────

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  canProceed: boolean;
  onBack: () => void;
  onNext: () => void;
}

export function NavigationButtons({
  currentStep,
  totalSteps,
  canProceed,
  onBack,
  onNext,
}: NavigationButtonsProps) {
  const isFirstStep = currentStep === 1;
  const isFinalStep = currentStep === totalSteps;

  return (
    <div className="flex items-center justify-between mt-8 pt-8 border-t border-slate-200">
      {/* Back Button */}
      <button
        onClick={onBack}
        disabled={isFirstStep}
        className={`
          inline-flex items-center gap-2 px-6 py-3 border border-slate-300 
          font-accent text-base font-medium rounded-full 
          transition-all duration-200
          ${
            isFirstStep
              ? "opacity-50 cursor-not-allowed text-slate-400"
              : "text-slate-700 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 active:scale-95"
          }
        `}
      >
        <ArrowLeftIcon className="w-5 h-5" />
        Back
      </button>

      {/* Next/Publish Button */}
      <button
        onClick={onNext}
        disabled={!canProceed}
        className={`
          group inline-flex items-center gap-3 px-6 py-3 border border-transparent 
          font-accent text-base font-medium rounded-full 
          shadow-sm transition-all duration-200
          ${
            canProceed
              ? "text-white bg-[#2663EB] hover:bg-[#2054C8] hover:shadow-md active:scale-95 focus:ring-2 focus:ring-[#2663EB] focus:ring-offset-2"
              : "opacity-50 cursor-not-allowed text-white bg-slate-400"
          }
        `}
      >
        {isFinalStep ? "Publish Survey" : "Next Step"}
        {canProceed && (
          <span className="relative w-6 h-6 rounded-full bg-white flex items-center justify-center overflow-hidden">
            <ArrowRightIcon className="w-4 h-4 text-[#2663EB] absolute -translate-x-8 group-hover:translate-x-0 transition-transform duration-300" />
          </span>
        )}
      </button>
    </div>
  );
}

