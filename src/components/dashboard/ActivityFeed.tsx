"use client";

import { useState, useEffect } from "react";
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
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/types/supabase";

type ActivityFeedRow = Database["public"]["Tables"]["activity_feed"]["Row"];

// Get default org ID from environment or use fallback
const DEFAULT_ORG_ID = process.env.NEXT_PUBLIC_DEFAULT_ORG_ID || '00000000-0000-0000-0000-000000000001';

/**
 * ActivityFeed Component
 * 
 * Displays real-time activity feed with Supabase Realtime subscriptions.
 * Shows survey creation, responses, updates, deletions, and AI summary generation events.
 */
export default function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityFeedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  // Fetch activities on mount and subscribe to real-time updates
  useEffect(() => {
    fetchActivities();

    console.log('🔌 Setting up Realtime subscription...');
    
    // Subscribe to real-time updates
    const channel = supabase.channel("activity_feed_changes");
    
    channel
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "activity_feed",
          filter: `org_id=eq.${DEFAULT_ORG_ID}`,
        },
        (payload) => {
          console.log("🔔 Activity feed update received:", payload);
          // Refresh activities when there's a change
          fetchActivities();
        }
      )
      .subscribe((status, err) => {
        console.log('📡 Realtime subscription status:', status, err);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime connected successfully!');
          setRealtimeStatus('connected');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          console.error('❌ Realtime connection error:', status, err);
          setRealtimeStatus('error');
        }
      });

    // Cleanup subscription on unmount
    return () => {
      console.log('🔌 Cleaning up Realtime subscription...');
      channel.unsubscribe();
    };
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("activity_feed")
        .select("*")
        .eq("org_id", DEFAULT_ORG_ID)
        .order("created_at", { ascending: false })
        .limit(10); // Limit to most recent 10 activities on dashboard

      if (fetchError) {
        throw fetchError;
      }

      console.log("Fetched activities:", data);
      setActivities(data || []);
    } catch (err) {
      console.error("Error fetching activities:", err);
      setError("Failed to load activity feed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
      default:
        return {
          icon: <BellIcon className="w-5 h-5" />,
          bgColor: "bg-slate-100",
          iconColor: "text-slate-600",
          label: type,
        };
    }
  };

  // Helper function to format time ago
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now.getTime() - activityTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  // Helper function to get description from details
  const getActivityDescription = (activity: ActivityFeedRow) => {
    const details = activity.details as any;
    
    switch (activity.type) {
      case "SURVEY_CREATED":
        return `Survey "${details?.survey_title || "Untitled"}" created with ${details?.question_count || 0} question${details?.question_count !== 1 ? "s" : ""}`;
      case "RESPONSE_RECEIVED":
        return `New response received for "${details?.survey_title || "survey"}"`;
      case "SURVEY_UPDATED":
        return `Survey "${details?.survey_title || "Untitled"}" was updated`;
      case "SURVEY_DELETED":
        return `Survey "${details?.survey_title || "Untitled"}" was deleted`;
      case "SUMMARY_GENERATED":
        return `AI summary generated for "${details?.survey_title || "survey"}"`;
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
        <div className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#2663EB] border-t-transparent"></div>
          <p className="font-body text-slate-600 mt-4">Loading activity feed...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="font-body text-red-700">{error}</p>
            <button
              onClick={fetchActivities}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
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
                  {activity.details && typeof activity.details === 'object' && (activity.details as any).audience && (
                    <p className="font-body text-xs text-slate-500 mt-1">
                      Audience: {(activity.details as any).audience}
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

