"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { ActivityFeed, StatCard, StepCard, InsightCard } from "@/components/dashboard";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import LoadingState from "@/components/common/LoadingState";
import ErrorState from "@/components/common/ErrorState";

/**
 * MoSurveys Landing Page (Dashboard)
 * 
 * This is the main landing page for MoSurveys, showing:
 * - Navigation to key sections (Surveys, Insights)
 * - Overview cards with empty states
 * - Real-time Activity Feed
 * - Modern, clean UI inspired by multi-step workflow designs
 */
export default function MoJeremiahDashboard() {
  const [activeSection, setActiveSection] = useState<string>("overview");
  const { stats, loading, error } = useDashboardStats();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <h1 className="font-heading text-2xl font-semibold text-[#2663EB]">MoSurveys</h1>
              <span className="ml-2 font-body text-sm text-slate-500">by MoFlo</span>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => setActiveSection("overview")}
                className={`px-3 py-2 font-accent text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeSection === "overview"
                    ? "text-[#2663EB] bg-blue-50"
                    : "text-slate-700 hover:text-[#2663EB] hover:bg-slate-50"
                }`}
              >
                Overview
              </button>
              <Link
                href="/mojeremiah/view"
                className="px-3 py-2 font-accent text-sm font-medium rounded-lg transition-all duration-200 text-slate-700 hover:text-[#2663EB] hover:bg-slate-50"
              >
                Surveys
              </Link>
              <button
                onClick={() => setActiveSection("insights")}
                className={`px-3 py-2 font-accent text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeSection === "insights"
                    ? "text-[#2663EB] bg-blue-50"
                    : "text-slate-700 hover:text-[#2663EB] hover:bg-slate-50"
                }`}
              >
                Insights
              </button>
            </nav>

            {/* CTA Button */}
            <div>
              <Link
                href="/mojeremiah/create"
                className="group inline-flex items-center gap-3 px-4 py-2 border border-transparent font-accent text-sm font-medium rounded-full text-white bg-[#2663EB] hover:bg-[#2054C8] transition-all duration-200 hover:shadow-md active:scale-95 focus:ring-2 focus:ring-[#2663EB] focus:ring-offset-2"
              >
                <span className="relative w-5 h-5 rounded-full bg-white flex items-center justify-center overflow-hidden">
                  <ArrowRightIcon className="w-3 h-3 text-[#2663EB] absolute -translate-x-8 group-hover:translate-x-0 transition-transform duration-300" />
                </span>
                Create Survey
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-slate-200">
          <nav className="flex overflow-x-auto px-4 space-x-4 py-2">
            <button
              onClick={() => setActiveSection("overview")}
              className={`px-3 py-2 font-accent text-sm font-medium rounded-lg whitespace-nowrap ${
                activeSection === "overview"
                  ? "text-[#2663EB] bg-blue-50"
                  : "text-slate-700"
              }`}
            >
              Overview
            </button>
            <Link
              href="/mojeremiah/view"
              className="px-3 py-2 font-accent text-sm font-medium rounded-lg whitespace-nowrap text-slate-700"
            >
              Surveys
            </Link>
            <button
              onClick={() => setActiveSection("insights")}
              className={`px-3 py-2 font-accent text-sm font-medium rounded-lg whitespace-nowrap ${
                activeSection === "insights"
                  ? "text-[#2663EB] bg-blue-50"
                  : "text-slate-700"
              }`}
            >
              Insights
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h2 className="font-heading text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight mb-2">
            Welcome to MoSurveys
          </h2>
          <p className="font-body text-slate-600 leading-relaxed">
            Create, manage, and analyze surveys with ease. Get started by creating your first survey.
          </p>
        </div>

        {/* Overview Section - Shows when overview is active */}
        {activeSection === "overview" && (
          <>
            {/* Loading State */}
            {loading && (
              <div className="mb-8">
                <LoadingState message="Loading dashboard stats..." />
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="mb-8">
                <ErrorState message={error} />
              </div>
            )}

            {/* Stats Cards - Show when data is loaded */}
            {!loading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Quick Stats Cards */}
                <StatCard
                  title="Total Surveys"
                  value={stats.totalSurveys.toString()}
                  description={
                    stats.totalSurveys === 0
                      ? "No surveys created yet"
                      : stats.totalSurveys === 1
                      ? "1 survey created"
                      : `${stats.totalSurveys} surveys created`
                  }
                  icon={<ClipboardDocumentListIcon className="w-6 h-6" />}
                  color="blue"
                />
                <StatCard
                  title="Total Responses"
                  value={stats.totalResponses.toString()}
                  description={
                    stats.totalResponses === 0
                      ? "No responses collected yet"
                      : stats.totalResponses === 1
                      ? "1 response collected"
                      : `${stats.totalResponses} responses collected`
                  }
                  icon={<ChatBubbleLeftRightIcon className="w-6 h-6" />}
                  color="green"
                />
                <StatCard
                  title="Active Surveys"
                  value={stats.activeSurveys.toString()}
                  description={
                    stats.activeSurveys === 0
                      ? "No active surveys"
                      : stats.activeSurveys === 1
                      ? "1 survey accepting responses"
                      : `${stats.activeSurveys} surveys accepting responses`
                  }
                  icon={<CheckCircleIcon className="w-6 h-6" />}
                  color="purple"
                />
              </div>
            )}

            {/* Activity Feed Component */}
            <div className="mb-8">
              <ActivityFeed />
            </div>

            {/* Getting Started Guide */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
              <h3 className="font-heading text-lg font-semibold text-slate-900 mb-6">
                Get Started with MoSurveys
              </h3>
              
              {/* Step-by-step guide */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0 md:space-x-6">
                <StepCard
                  number={1}
                  title="Create Survey"
                  description="Design your survey with custom questions"
                  status="pending"
                />
                
                <div className="hidden md:block text-[#2663EB] text-2xl">→</div>
                
                <StepCard
                  number={2}
                  title="Share & Collect"
                  description="Share via link and collect responses"
                  status="pending"
                />
                
                <div className="hidden md:block text-[#2663EB] text-2xl">→</div>
                
                <StepCard
                  number={3}
                  title="Analyze Results"
                  description="View insights and analytics"
                  status="pending"
                />
              </div>

              <div className="mt-8 text-center">
                <Link
                  href="/mojeremiah/create"
                  className="group inline-flex items-center gap-3 px-6 py-3 border border-transparent font-accent text-base font-medium rounded-full text-white bg-[#2663EB] hover:bg-[#2054C8] transition-all duration-200 hover:shadow-md active:scale-95 focus:ring-2 focus:ring-[#2663EB] focus:ring-offset-2"
                >
                  <span className="relative w-6 h-6 rounded-full bg-white flex items-center justify-center overflow-hidden">
                    <ArrowRightIcon className="w-4 h-4 text-[#2663EB] absolute -translate-x-8 group-hover:translate-x-0 transition-transform duration-300" />
                  </span>
                  Start Creating
                </Link>
              </div>
            </div>
          </>
        )}

        {/* Surveys Section */}
        {activeSection === "surveys" && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
            <div className="text-center max-w-md mx-auto">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                  <ClipboardDocumentListIcon className="w-8 h-8 text-[#2663EB]" />
                </div>
              </div>
              <h3 className="font-heading text-xl font-semibold text-slate-900 mb-2">
                No Surveys Yet
              </h3>
              <p className="font-body text-slate-600 leading-relaxed mb-6">
                Get started by creating your first survey. Design questions, share with your audience, and collect valuable feedback.
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

        {/* Key Insights Section */}
        {activeSection === "insights" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
              <h3 className="font-heading text-lg font-semibold text-slate-900 mb-6">
                Key Insights
              </h3>
              
              {/* Empty State */}
              <div className="text-center py-12">
                <div className="mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#2663EB] to-[#6366F1] rounded-full">
                    <ChartBarIcon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h4 className="font-heading text-lg font-medium text-slate-900 mb-2">
                  No Insights Available
                </h4>
                <p className="font-body text-slate-600 leading-relaxed mb-4">
                  Insights and analytics will appear here once you start collecting survey responses.
                </p>
              </div>

              {/* Insights Grid (placeholder for when there's data) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 hidden">
                {/* These will be populated with real insights later */}
                <InsightCard
                  title="Response Rate"
                  value="0%"
                  trend="neutral"
                />
                <InsightCard
                  title="Avg. Completion Time"
                  value="0 min"
                  trend="neutral"
                />
              </div>
            </div>

            {/* Additional Insights Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h4 className="font-heading text-md font-semibold text-slate-900 mb-4">
                  Popular Questions
                </h4>
                <p className="font-body text-slate-500 text-sm">
                  No data available yet
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h4 className="font-heading text-md font-semibold text-slate-900 mb-4">
                  Recent Feedback
                </h4>
                <p className="font-body text-slate-500 text-sm">
                  No data available yet
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center font-body text-sm text-slate-500">
            © 2025 MoSurveys by MoFlo Cloud. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
