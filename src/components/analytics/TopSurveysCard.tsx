import Link from "next/link";

/**
 * TopSurveysCard Component
 * 
 * Displays a list of top performing surveys by response count.
 * Each survey is clickable and links to its detailed analytics page.
 * 
 * @param topSurveys - Array of survey data with response counts and sentiment info
 */

interface Survey {
  id: string;
  title: string;
  version: number;
}

interface TopSurvey {
  survey: Survey;
  responseCount: number;
  avgSentiment: string;
}

interface TopSurveysCardProps {
  topSurveys: TopSurvey[];
  limit?: number;
}

export default function TopSurveysCard({ topSurveys, limit = 5 }: TopSurveysCardProps) {
  const displayedSurveys = topSurveys.slice(0, limit);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <h4 className="font-heading text-md font-semibold text-slate-900 mb-4">
        Top Performing Surveys
      </h4>
      <div className="space-y-3">
        {displayedSurveys.map((item) => (
          <Link
            key={item.survey.id}
            href={`/mojeremiah/analytics/${item.survey.id}`}
            className="block p-3 rounded-lg hover:bg-slate-50 transition-colors duration-200 border border-transparent hover:border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm font-medium text-slate-900 truncate">
                  {item.survey.title}
                </p>
                <p className="font-body text-xs text-slate-500 mt-0.5">
                  v{item.survey.version} • {item.avgSentiment}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-[#2663EB] font-accent text-xs font-medium rounded-full">
                  {item.responseCount} responses
                </span>
              </div>
            </div>
          </Link>
        ))}
        {displayedSurveys.length === 0 && (
          <p className="font-body text-sm text-slate-500 text-center py-4">
            No survey data available yet
          </p>
        )}
      </div>
    </div>
  );
}

