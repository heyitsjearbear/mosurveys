import { CheckIcon } from "@heroicons/react/24/outline";

// ─────────────────────────────────────────────
// Progress Bar Component
// ─────────────────────────────────────────────

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export function ProgressBar({ currentStep, totalSteps, stepLabels }: ProgressBarProps) {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-3xl mx-auto">
          {/* Step Indicators */}
          <div className="flex items-center justify-between mb-4">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 
                    font-accent text-sm font-semibold transition-all duration-200
                    ${
                      currentStep >= step
                        ? "bg-[#2663EB] border-[#2663EB] text-white"
                        : "bg-white border-slate-300 text-slate-400"
                    }
                  `}
                >
                  {currentStep > step ? <CheckIcon className="w-5 h-5" /> : step}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className="font-accent text-sm font-medium text-slate-900">
                    {stepLabels[step - 1]}
                  </p>
                </div>
                {step < totalSteps && (
                  <div
                    className={`
                      w-12 sm:w-24 h-1 mx-4 rounded-full transition-colors duration-200
                      ${currentStep > step ? "bg-[#2663EB]" : "bg-slate-200"}
                    `}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#2663EB] to-[#6366F1] h-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

