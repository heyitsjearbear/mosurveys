"use client";
import { useEffect } from "react";
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";

/**
 * Toast Component
 * 
 * Displays temporary notification messages with auto-dismiss
 * Used for success/error feedback throughout the app
 */

export type ToastType = "success" | "error";

export interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number; // Auto-dismiss duration in milliseconds (default: 4000)
}

export default function Toast({ message, type, onClose, duration = 4000 }: ToastProps) {
  // Auto-dismiss after duration
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
      icon: <CheckCircleIcon className="w-5 h-5 text-green-500" />,
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      icon: <XCircleIcon className="w-5 h-5 text-red-500" />,
    },
  };

  const style = styles[type];

  return (
    <div
      className={`
        fixed bottom-4 right-4 z-50
        flex items-center gap-3
        px-4 py-3 rounded-lg shadow-lg border
        ${style.bg} ${style.border}
        animate-in slide-in-from-bottom-2 fade-in duration-300
      `}
      role="alert"
    >
      {/* Icon */}
      <div className="flex-shrink-0">{style.icon}</div>

      {/* Message */}
      <p className={`font-body text-sm font-medium ${style.text}`}>{message}</p>

      {/* Close Button */}
      <button
        onClick={onClose}
        className={`
          flex-shrink-0 ml-2
          ${style.text} hover:opacity-70
          transition-opacity duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
        `}
        aria-label="Close notification"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  );
}

