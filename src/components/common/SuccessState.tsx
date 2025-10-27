/**
 * SuccessState Component
 * 
 * Displays a success message with checkmark icon.
 * Used for survey submissions, confirmations, and other success scenarios.
 * 
 * @example
 * <SuccessState
 *   title="Thank You!"
 *   message="Your response has been submitted successfully."
 *   action={<button>View Results</button>}
 * />
 */

interface SuccessStateProps {
  /** Main success title */
  title: string;
  /** Success message/description */
  message: string;
  /** Optional action button */
  action?: React.ReactNode;
  /** Optional icon size (default: 16) */
  iconSize?: number;
}

export default function SuccessState({
  title,
  message,
  action,
  iconSize = 16,
}: SuccessStateProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="mb-4">
          <div
            className="inline-flex items-center justify-center bg-green-100 rounded-full"
            style={{ width: `${iconSize * 4}px`, height: `${iconSize * 4}px` }}
          >
            <svg
              className="text-green-600"
              style={{ width: `${iconSize * 2}px`, height: `${iconSize * 2}px` }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-2">
          {title}
        </h2>

        {/* Message */}
        <p className="font-body text-slate-600 mb-6">
          {message}
        </p>

        {/* Optional Action Button */}
        {action && <div className="mt-6">{action}</div>}
      </div>
    </div>
  );
}

