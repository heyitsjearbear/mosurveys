"use client";

import Link from "next/link";
import {
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  PencilIcon,
  TrashIcon,
  SparklesIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import type { Database } from "@/types/supabase";
import { formatTimeAgo } from "@/lib/utils";
import { LoadingState, ErrorState } from "@/components/common";
import { useRealtimeActivityFeed } from "@/hooks/useRealtimeActivityFeed";
import type { 
  ActivityDetails, 
  SurveyCreatedDetails,
  ResponseReceivedDetails,
  SurveyUpdatedDetails,
  SurveyDeletedDetails,
  SummaryGeneratedDetails,
  SurveyEditedDetails
} from "@/types/activity";

type ActivityFeedRow = Database["public"]["Tables"]["activity_feed"]["Row"];

/**
 * ActivityFeed Component
 * 
 * Displays real-time activity feed with Supabase Realtime subscriptions.
 * Shows survey creation, responses, updates, deletions, and AI summary generation events.
 * 
 * 
 * Features:
 * - Realtime updates via Supabase subscriptions
 * - Proper cleanup to prevent memory leaks
 * - Safe state updates (checks if component is mounted)
 */
export default function ActivityFeed() {
  const { activities, loading, error, realtimeStatus, refetch } = useRealtimeActivityFeed();

  // Helper function to get icon and color for activity type
  const getActivityStyle = (type: string) => {
    switch (type) {
      case "SURVEY_CREATED":
        return {
          icon: <ClipboardDocumentListIcon className="w-5 h-5" />,
          bgColor: "bg-blue-100",
          iconColor: "text-[#2663EB]",
          label: "Survey Created",
        };
      case "RESPONSE_RECEIVED":
        return {
          icon: <ChatBubbleLeftRightIcon className="w-5 h-5" />,
          bgColor: "bg-green-100",
          iconColor: "text-green-600",
          label: "Response Received",
        };
      case "SURVEY_UPDATED":
        return {
          icon: <PencilIcon className="w-5 h-5" />,
          bgColor: "bg-amber-100",
          iconColor: "text-amber-600",
          label: "Survey Updated",
        };
      case "SURVEY_DELETED":
        return {
          icon: <TrashIcon className="w-5 h-5" />,
          bgColor: "bg-red-100",
          iconColor: "text-red-600",
          label: "Survey Deleted",
        };
      case "SUMMARY_GENERATED":
        return {
          icon: <SparklesIcon className="w-5 h-5" />,
          bgColor: "bg-gradient-to-r from-[#2663EB] to-[#6366F1]",
          iconColor: "text-white",
          label: "AI Summary Generated",
        };
      case "SURVEY_EDITED":
        return {
          icon: <PencilIcon className="w-5 h-5" />,
          bgColor: "bg-purple-100",
          iconColor: "text-purple-600",
          label: "Survey Edited",
        };
      default:
        return {
          icon: <BellIcon className="w-5 h-5" />,
          bgColor: "bg-slate-100",
          iconColor: "text-slate-600",
          label: type,
        };
    }
  };


  // Helper function to get description from details
  // 
  // Industry Practice: Type Narrowing with Switch Statements
  // ─────────────────────────────────────────────────────────
  // By casting to the specific detail type inside each case,
  // TypeScript knows exactly what fields are available.
  // This gives us:
  // 1. Full autocomplete for each event type
  // 2. Compile-time errors if we access wrong fields
  // 3. No need for optional chaining (?.) on required fields
  const getActivityDescription = (activity: ActivityFeedRow) => {
    // Cast through 'unknown' when converting from Supabase Json type to our types
    // This is the standard pattern for JSONB fields from databases
    const details = activity.details as unknown as ActivityDetails;
    
    switch (activity.type) {
      case "SURVEY_CREATED": {
        const d = details as SurveyCreatedDetails;
        return `Survey "${d.survey_title}" created with ${d.question_count} question${d.question_count !== 1 ? "s" : ""}`;
      }
      case "RESPONSE_RECEIVED": {
        const d = details as ResponseReceivedDetails;
        return `New response received for "${d.survey_title}"`;
      }
      case "SURVEY_UPDATED": {
        const d = details as SurveyUpdatedDetails;
        return `Survey "${d.survey_title}" was updated`;
      }
      case "SURVEY_DELETED": {
        const d = details as SurveyDeletedDetails;
        return `Survey "${d.survey_title}" was deleted`;
      }
      case "SUMMARY_GENERATED": {
        const d = details as SummaryGeneratedDetails;
        return `AI summary generated for "${d.survey_title}"`;
      }
      case "SURVEY_EDITED": {
        const d = details as SurveyEditedDetails;
        const changelogText = d.changelog && d.changelog !== 'No changelog provided' 
          ? `: ${d.changelog}` 
          : '';
        return `Survey "${d.survey_title}" updated to v${d.version}${changelogText}`;
      }
      default:
        return "Activity event";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-lg font-semibold text-slate-900">
              Recent Activity
            </h2>
            <p className="font-body text-sm text-slate-600">
              {activities.length} event{activities.length !== 1 ? "s" : ""}
            </p>
          </div>
          
          {/* Realtime Status Indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              realtimeStatus === 'connected' ? 'bg-green-500' :
              realtimeStatus === 'error' ? 'bg-red-500' :
              'bg-amber-500 animate-pulse'
            }`}></div>
            <span className="font-body text-xs text-slate-500">
              {realtimeStatus === 'connected' ? 'Live' :
               realtimeStatus === 'error' ? 'Disconnected' :
               'Connecting...'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Loading State */}
      {loading && (
        <div className="p-6">
          <LoadingState message="Loading activity feed..." />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-6">
          <ErrorState message={error} onRetry={refetch} />
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && activities.length === 0 && (
        <div className="p-12">
          <div className="text-center max-w-md mx-auto">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full">
                <BellIcon className="w-8 h-8 text-slate-600" />
              </div>
            </div>
            <h3 className="font-heading text-xl font-semibold text-slate-900 mb-2">
              No Activity Yet
            </h3>
            <p className="font-body text-slate-600 leading-relaxed mb-6">
              Activity from your surveys will appear here. Create a survey to get started.
            </p>
            <Link
              href="/mojeremiah/create"
              className="group inline-flex items-center gap-3 px-6 py-3 border border-transparent font-accent text-base font-medium rounded-full text-white bg-[#2663EB] hover:bg-[#2054C8] transition-all duration-200 hover:shadow-md active:scale-95 focus:ring-2 focus:ring-[#2663EB] focus:ring-offset-2"
            >
              <span className="relative w-6 h-6 rounded-full bg-white flex items-center justify-center overflow-hidden">
                <ArrowRightIcon className="w-4 h-4 text-[#2663EB] absolute -translate-x-8 group-hover:translate-x-0 transition-transform duration-300" />
              </span>
              Create Your First Survey
            </Link>
          </div>
        </div>
      )}

      {/* Activity Timeline */}
      {!loading && !error && activities.length > 0 && (
        <div className="divide-y divide-slate-200">
          {activities.map((activity) => {
            const style = getActivityStyle(activity.type);
            return (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-6 hover:bg-slate-50 transition-colors duration-200"
              >
                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 ${style.bgColor} rounded-full flex items-center justify-center ${style.iconColor}`}>
                  {style.icon}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-accent text-sm font-medium text-slate-900 mb-1">
                        {style.label}
                      </p>
                      <p className="font-body text-sm text-slate-600">
                        {getActivityDescription(activity)}
                      </p>
                    </div>
                    <span className="flex-shrink-0 font-body text-xs text-slate-500">
                      {formatTimeAgo(activity.created_at)}
                    </span>
                  </div>
                  
                  {/* Additional details if present */}
                  {/* Type-safe audience display - only SURVEY_CREATED events have audience */}
                  {activity.type === 'SURVEY_CREATED' && activity.details && (
                    <p className="font-body text-xs text-slate-500 mt-1">
                      Audience: {(activity.details as unknown as SurveyCreatedDetails).audience}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

