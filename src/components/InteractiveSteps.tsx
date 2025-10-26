"use client";

import { useState, useEffect } from "react";

/**
 * InteractiveSteps Component
 * 
 * Displays a gamified step-by-step walkthrough of the MoSurveys workflow.
 * Features:
 * - 4 clickable steps with numbered labels
 * - Active step highlighted with blue progress bar that fills up
 * - Description shown below for the active step
 * - Progress bar fills from 0% to 100% over 4 seconds
 * - Auto-advances to next step when bar is full
 * - Loops back to step 1 after step 4
 */

interface Step {
  number: string;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: "01",
    title: "Setup Survey Details",
    description: "Create your survey by defining the title, target audience, and basic settings. Set up the foundation for your feedback collection.",
  },
  {
    number: "02",
    title: "AI-powered Question Creation",
    description: "Use MoSurveys to generate platform-specific questions on any subject you choose. Or manually add your own custom questions.",
  },
  {
    number: "03",
    title: "Share & Collect Responses",
    description: "Share your survey via link, email, or social media. Collect real-time responses from your target audience across any platform.",
  },
  {
    number: "04",
    title: "Analyze and Optimize",
    description: "Review responses with real-time analytics and AI-powered insights. Optimize your surveys based on engagement data and sentiment analysis.",
  },
];

const STEP_DURATION = 4000; // 4 seconds per step

export default function InteractiveSteps() {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);

  // Progress bar animation and step advancement
  useEffect(() => {
    const startTime = Date.now();
    
    const animationFrame = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / STEP_DURATION) * 100, 100);
      
      setProgress(newProgress);
      
      if (elapsed < STEP_DURATION) {
        requestAnimationFrame(animationFrame);
      } else {
        // Move to next step when progress reaches 100%
        setActiveStep((current) => (current + 1) % steps.length);
        setProgress(0);
      }
    };
    
    const frameId = requestAnimationFrame(animationFrame);
    
    return () => cancelAnimationFrame(frameId);
  }, [activeStep]);

  // Handle manual step click - reset progress
  const handleStepClick = (index: number) => {
    setActiveStep(index);
    setProgress(0);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
      {/* Step Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {steps.map((step, index) => (
          <button
            key={step.number}
            onClick={() => handleStepClick(index)}
            className="text-left group"
          >
            {/* Step Number and Title */}
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline gap-2">
                <span
                  className={`font-heading text-lg transition-colors duration-200 ${
                    activeStep === index
                      ? "text-slate-900 font-semibold"
                      : "text-slate-400 group-hover:text-slate-600"
                  }`}
                >
                  {step.number}.
                </span>
                <span
                  className={`font-heading text-base transition-colors duration-200 ${
                    activeStep === index
                      ? "text-slate-900 font-semibold"
                      : "text-slate-500 group-hover:text-slate-700"
                  }`}
                >
                  {step.title}
                </span>
              </div>
              {/* Progress Bar - Fills up for active step */}
              <div className="h-1 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    activeStep === index
                      ? "bg-[#2663EB]"
                      : "bg-slate-200"
                  }`}
                  style={{
                    width: activeStep === index ? `${progress}%` : "0%",
                    transition: activeStep === index ? "none" : "width 0.3s ease",
                  }}
                />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Step Description with Fade Transition */}
      <div className="min-h-[80px] pt-6 border-t border-slate-200">
        <p
          key={activeStep}
          className="font-body text-slate-600 text-base leading-relaxed animate-fade-in"
        >
          {steps[activeStep].description}
        </p>
      </div>

      {/* Progress Dots (Mobile-friendly indicator) */}
      <div className="flex justify-center gap-2 mt-6 sm:hidden">
        {steps.map((_, index) => (
          <button
            key={index}
            onClick={() => handleStepClick(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              activeStep === index ? "bg-[#2663EB] w-8" : "bg-slate-300"
            }`}
            aria-label={`Go to step ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

