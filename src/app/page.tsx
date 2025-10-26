import Link from "next/link";
import {
  ClipboardDocumentListIcon,
  ChartBarIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import InteractiveSteps from "@/components/InteractiveSteps";
import { FeatureCard } from "@/components/common";

/**
 * MoSurveys Landing/Marketing Page
 * 
 * This is the public-facing landing page for MoSurveys.
 * Features:
 * - Hero section with value proposition
 * - Feature highlights with icons
 * - Call-to-action to get started
 * - Modern, clean design matching the dashboard aesthetic
 */

export default function Home() {
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

            {/* CTA Button */}
            <div>
              <Link
                href="/mojeremiah"
                className="group inline-flex items-center gap-3 px-4 py-2 border border-transparent font-accent text-sm font-medium rounded-full text-white bg-[#2663EB] hover:bg-[#2054C8] transition-all duration-200 hover:shadow-md active:scale-95 focus:ring-2 focus:ring-[#2663EB] focus:ring-offset-2"
              >
                <span className="relative w-5 h-5 rounded-full bg-white flex items-center justify-center overflow-hidden">
                  <ArrowRightIcon className="w-3 h-3 text-[#2663EB] absolute -translate-x-8 group-hover:translate-x-0 transition-transform duration-300" />
                </span>
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="py-16 lg:py-20 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-heading text-4xl md:text-5xl font-semibold text-slate-900 tracking-tight mb-6">
              Create Surveys That Get Results
            </h2>
            <p className="font-body text-lg md:text-xl text-slate-600 leading-relaxed mb-8">
              Build, share, and analyze surveys with ease. Collect valuable feedback 
              from your audience with our intuitive survey platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/mojeremiah"
                className="group inline-flex items-center justify-center gap-3 px-6 py-3 border border-transparent font-accent text-base font-medium rounded-full text-white bg-[#2663EB] hover:bg-[#2054C8] transition-all duration-200 hover:shadow-md active:scale-95 focus:ring-2 focus:ring-[#2663EB] focus:ring-offset-2"
              >
                <span className="relative w-6 h-6 rounded-full bg-white flex items-center justify-center overflow-hidden">
                  <ArrowRightIcon className="w-4 h-4 text-[#2663EB] absolute -translate-x-8 group-hover:translate-x-0 transition-transform duration-300" />
                </span>
                Start Creating
              </Link>
              <Link
                href="/mojeremiah"
                className="group inline-flex items-center justify-center gap-3 px-6 py-3 border border-slate-300 font-accent text-base font-medium rounded-full text-slate-700 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 transition-all duration-200 active:scale-95 focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              >
                <span className="relative w-6 h-6 rounded-full bg-[#2663EB] flex items-center justify-center overflow-hidden">
                  <ArrowRightIcon className="w-4 h-4 text-white absolute -translate-x-8 group-hover:translate-x-0 transition-transform duration-300" />
                </span>
                View Dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works Section - Interactive */}
        <section className="py-12 lg:py-16 mb-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="font-heading text-3xl font-semibold text-slate-900 tracking-tight mb-4">
                How It Works
              </h3>
              <p className="font-body text-lg text-slate-600 leading-relaxed">
                Four simple steps to start collecting feedback
              </p>
            </div>

            <InteractiveSteps />

            <div className="mt-12 text-center">
              <Link
                href="/mojeremiah"
                className="group inline-flex items-center gap-3 px-8 py-4 border border-transparent font-accent text-lg font-medium rounded-full text-white bg-[#2663EB] hover:bg-[#2054C8] transition-all duration-200 hover:shadow-md active:scale-95 focus:ring-2 focus:ring-[#2663EB] focus:ring-offset-2"
              >
                <span className="relative w-7 h-7 rounded-full bg-white flex items-center justify-center overflow-hidden">
                  <ArrowRightIcon className="w-5 h-5 text-[#2663EB] absolute -translate-x-8 group-hover:translate-x-0 transition-transform duration-300" />
                </span>
                Get Started Now
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 lg:py-20">
          <div className="text-center mb-12">
            <h3 className="font-heading text-3xl font-semibold text-slate-900 tracking-tight mb-4">
              Everything You Need to Succeed
            </h3>
            <p className="font-body text-lg text-slate-600 leading-relaxed">
              Powerful features to help you create, share, and analyze surveys
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature Cards */}
            <FeatureCard
              icon={<ClipboardDocumentListIcon className="w-8 h-8 text-[#2663EB]" />}
              title="Easy Survey Creation"
              description="Build professional surveys in minutes with our intuitive drag-and-drop interface. No coding required."
            />
            <FeatureCard
              icon={<ShareIcon className="w-8 h-8 text-[#2663EB]" />}
              title="Easy Sharing"
              description="Share your surveys anywhere with simple links. Perfect for email, social media, and on-the-go feedback collection."
            />
            <FeatureCard
              icon={<ChartBarIcon className="w-8 h-8 text-[#2663EB]" />}
              title="Real-time Analytics"
              description="Track responses as they come in with live dashboards and detailed analytics to understand your data."
            />
            <FeatureCard
              icon={<SparklesIcon className="w-8 h-8 text-[#2663EB]" />}
              title="AI-Powered Insights"
              description="Get intelligent summaries and insights from your survey data powered by advanced AI technology."
            />
            <FeatureCard
              icon={<CheckCircleIcon className="w-8 h-8 text-[#2663EB]" />}
              title="Multiple Question Types"
              description="Choose from text, multiple choice, ratings, and more to build the perfect survey for your needs."
            />
            <FeatureCard
              icon={<ArrowRightIcon className="w-8 h-8 text-[#2663EB]" />}
              title="Seamless Integration"
              description="Connect with your existing tools and workflows. Part of the MoFlo Cloud ecosystem."
            />
          </div>
        </section>
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

