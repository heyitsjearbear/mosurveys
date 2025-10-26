"use client";

import Link from "next/link";
import { useState } from "react";

/**
 * MoSurveys Landing Page (Dashboard)
 * 
 * This is the main landing page for MoSurveys, showing:
 * - Navigation to key sections (Surveys, Activity Feed, Insights)
 * - Overview cards with empty states
 * - Modern, clean UI inspired by multi-step workflow designs
 */

export default function MoJeremiahDashboard() {
  const [activeSection, setActiveSection] = useState<string>("overview");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">MoSurveys</h1>
              <span className="ml-2 text-sm text-gray-500">by MoFlo</span>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => setActiveSection("overview")}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeSection === "overview"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveSection("surveys")}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeSection === "surveys"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                Surveys
              </button>
              <button
                onClick={() => setActiveSection("activity")}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeSection === "activity"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                Activity Feed
              </button>
              <button
                onClick={() => setActiveSection("insights")}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeSection === "insights"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                Insights
              </button>
            </nav>

            {/* CTA Button */}
            <div>
              <Link
                href="/mojeremiah/create"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Create Survey
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200">
          <nav className="flex overflow-x-auto px-4 space-x-4 py-2">
            <button
              onClick={() => setActiveSection("overview")}
              className={`px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                activeSection === "overview"
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveSection("surveys")}
              className={`px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                activeSection === "surveys"
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700"
              }`}
            >
              Surveys
            </button>
            <button
              onClick={() => setActiveSection("activity")}
              className={`px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                activeSection === "activity"
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700"
              }`}
            >
              Activity
            </button>
            <button
              onClick={() => setActiveSection("insights")}
              className={`px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                activeSection === "insights"
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700"
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to MoSurveys
          </h2>
          <p className="text-gray-600">
            Create, manage, and analyze surveys with ease. Get started by creating your first survey.
          </p>
        </div>

        {/* Overview Section - Shows when overview is active */}
        {activeSection === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Quick Stats Cards */}
            <StatCard
              title="Total Surveys"
              value="0"
              description="No surveys created yet"
              icon="📋"
              color="blue"
            />
            <StatCard
              title="Total Responses"
              value="0"
              description="No responses collected yet"
              icon="💬"
              color="green"
            />
            <StatCard
              title="Active Surveys"
              value="0"
              description="No active surveys"
              icon="✅"
              color="purple"
            />
          </div>
        )}

        {/* Surveys Section */}
        {activeSection === "surveys" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center max-w-md mx-auto">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                  <span className="text-3xl">📋</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Surveys Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Get started by creating your first survey. Design questions, share with your audience, and collect valuable feedback.
              </p>
              <Link
                href="/mojeremiah/create"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Create Your First Survey
              </Link>
            </div>
          </div>
        )}

        {/* Activity Feed Section */}
        {activeSection === "activity" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Activity Feed</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700">
                View All
              </button>
            </div>
            
            {/* Empty State */}
            <div className="text-center py-12">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full">
                  <span className="text-3xl">🔔</span>
                </div>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No Activity Yet
              </h4>
              <p className="text-gray-600">
                Activity from your surveys will appear here. Create a survey to get started.
              </p>
            </div>

            {/* Activity Timeline (placeholder for when there's data) */}
            <div className="space-y-4 hidden">
              {/* This will be populated with real activity items later */}
              <ActivityItem
                type="survey_created"
                title="New survey created"
                description="Customer Feedback Survey"
                time="2 hours ago"
              />
            </div>
          </div>
        )}

        {/* Key Insights Section */}
        {activeSection === "insights" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Key Insights
              </h3>
              
              {/* Empty State */}
              <div className="text-center py-12">
                <div className="mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full">
                    <span className="text-3xl">📊</span>
                  </div>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  No Insights Available
                </h4>
                <p className="text-gray-600 mb-4">
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
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">
                  Popular Questions
                </h4>
                <p className="text-gray-500 text-sm">
                  No data available yet
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">
                  Recent Feedback
                </h4>
                <p className="text-gray-500 text-sm">
                  No data available yet
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Getting Started Guide (only show on overview) */}
        {activeSection === "overview" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Get Started with MoSurveys
            </h3>
            
            {/* Step-by-step guide similar to the UI inspiration */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0 md:space-x-6">
              <StepCard
                number={1}
                title="Create Survey"
                description="Design your survey with custom questions"
                status="pending"
              />
              
              <div className="hidden md:block text-blue-600 text-2xl">→</div>
              
              <StepCard
                number={2}
                title="Share & Collect"
                description="Share via QR code or link"
                status="pending"
              />
              
              <div className="hidden md:block text-blue-600 text-2xl">→</div>
              
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
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Start Creating
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            © 2025 MoSurveys by MoFlo Cloud. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

/**
 * StatCard Component
 * Displays a quick stat with icon and description
 */
interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: string;
  color: "blue" | "green" | "purple";
}

function StatCard({ title, value, description, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm font-medium text-gray-700 mb-1">{title}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );
}

/**
 * StepCard Component
 * Displays a step in the getting started guide
 */
interface StepCardProps {
  number: number;
  title: string;
  description: string;
  status: "completed" | "active" | "pending";
}

function StepCard({ number, title, description, status }: StepCardProps) {
  const statusStyles = {
    completed: "bg-blue-600 text-white",
    active: "bg-blue-100 text-blue-600 border-2 border-blue-600",
    pending: "bg-gray-100 text-gray-400",
  };

  return (
    <div className="flex-1 text-center">
      <div className="flex flex-col items-center">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold mb-3 ${statusStyles[status]}`}
        >
          {number}
        </div>
        <h4 className="text-sm font-semibold text-gray-900 mb-1">{title}</h4>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
    </div>
  );
}

/**
 * ActivityItem Component
 * Displays an individual activity item (for future use)
 */
interface ActivityItemProps {
  type: string;
  title: string;
  description: string;
  time: string;
}

function ActivityItem({ type, title, description, time }: ActivityItemProps) {
  return (
    <div className="flex items-start space-x-3 p-4 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 font-semibold">📋</span>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{description}</p>
        <p className="text-xs text-gray-500 mt-1">{time}</p>
      </div>
    </div>
  );
}

/**
 * InsightCard Component
 * Displays an insight metric (for future use)
 */
interface InsightCardProps {
  title: string;
  value: string;
  trend: "up" | "down" | "neutral";
}

function InsightCard({ title, value, trend }: InsightCardProps) {
  const trendIcons = {
    up: "📈",
    down: "📉",
    neutral: "➡️",
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-700">{title}</p>
        <span className="text-lg">{trendIcons[trend]}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

