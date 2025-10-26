/**
 * LoadingState Component
 * 
 * Reusable loading spinner with message
 * Used across multiple pages for consistent loading UX
 */

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#2663EB] border-t-transparent"></div>
      <p className="font-body text-slate-600 mt-4">{message}</p>
    </div>
  );
}

