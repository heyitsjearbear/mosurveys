interface NewResponseNotificationProps {
  count: number;
  onRefresh: () => void;
}

/**
 * NewResponseNotification Component
 *
 * Displays a floating notification at the top-right of the screen when new
 * responses arrive in real-time. Features a pinging animation and refresh action.
 *
 * @param count - Number of new responses received
 * @param onRefresh - Callback to refresh analytics data
 */
export function NewResponseNotification({
  count,
  onRefresh,
}: NewResponseNotificationProps) {
  return (
    <div className="fixed top-20 right-4 z-50 animate-bounce">
      <button
        onClick={onRefresh}
        className="flex items-center gap-2 px-4 py-3 bg-[#2663EB] text-white font-accent text-sm font-medium rounded-full shadow-lg hover:bg-[#2054C8] transition-colors duration-200"
      >
        {/* Pinging indicator dot */}
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        {count} new {count === 1 ? 'response' : 'responses'}
      </button>
    </div>
  );
}
