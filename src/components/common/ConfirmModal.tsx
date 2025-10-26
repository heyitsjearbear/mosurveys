import { ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/outline";

/**
 * ConfirmModal Component
 * 
 * A reusable confirmation dialog for destructive actions
 * Provides clear messaging and confirmation before proceeding
 */

export interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ConfirmModal({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmModalProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="
            bg-white rounded-lg shadow-2xl border border-slate-200
            max-w-md w-full p-6
            animate-in zoom-in-95 fade-in duration-200
          "
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            {/* Warning Icon */}
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>

            {/* Title */}
            <div className="flex-1">
              <h3
                id="modal-title"
                className="font-heading text-lg font-semibold text-slate-900"
              >
                {title}
              </h3>
            </div>

            {/* Close Button */}
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="
                flex-shrink-0 text-slate-400 hover:text-slate-600
                transition-colors duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
              "
              aria-label="Close"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Message */}
          <p className="font-body text-sm text-slate-600 mb-6 ml-14">
            {message}
          </p>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="
                px-4 py-2 border border-slate-300
                font-accent text-sm font-medium rounded-lg
                text-slate-700 bg-white
                hover:bg-slate-50 hover:border-slate-400
                transition-all duration-200
                active:scale-95
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
              "
            >
              {cancelLabel}
            </button>

            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="
                px-4 py-2 border border-transparent
                font-accent text-sm font-medium rounded-lg
                text-white bg-red-600
                hover:bg-red-700
                transition-all duration-200
                active:scale-95
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:ring-2 focus:ring-red-600 focus:ring-offset-2
                flex items-center gap-2
              "
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

