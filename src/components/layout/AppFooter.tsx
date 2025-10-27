/**
 * AppFooter Component
 * 
 * Reusable footer for MoSurveys pages.
 * Displays copyright information and branding.
 */

export default function AppFooter() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <p className="text-center font-body text-sm text-slate-500">
          © 2025 MoSurveys by MoFlo Cloud. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

