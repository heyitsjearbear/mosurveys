import type { Database } from "@/types/supabase";

type Response = Database["public"]["Tables"]["responses"]["Row"];
type SurveyQuestion = Database["public"]["Tables"]["survey_questions"]["Row"];

interface ResponseCardProps {
  response: Response;
  questions: SurveyQuestion[];
  responseNumber: number;
}

export default function ResponseCard({
  response,
  questions,
  responseNumber,
}: ResponseCardProps) {
  const answers = response.answers as Record<string, string>;
  
  const sentimentColors = {
    positive: "bg-green-100 text-green-700",
    negative: "bg-red-100 text-red-700",
    neutral: "bg-slate-100 text-slate-700",
    mixed: "bg-amber-100 text-amber-700",
  };

  const sentimentColor = sentimentColors[response.sentiment as keyof typeof sentimentColors] || "bg-slate-100 text-slate-700";

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="font-accent text-sm font-medium text-slate-900">
          Response #{responseNumber}
        </span>
        <div className="flex items-center gap-2">
          {response.sentiment && (
            <span className={`px-2 py-1 ${sentimentColor} font-accent text-xs font-medium rounded-full capitalize`}>
              {response.sentiment}
            </span>
          )}
          <span className="font-body text-xs text-slate-500">
            {new Date(response.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
      
      {response.summary && (
        <p className="font-body text-sm text-slate-700 mb-4 p-3 bg-slate-50 rounded-lg">
          {response.summary}
        </p>
      )}
      
      <div className="space-y-3">
        {questions.map((question) => (
          <div key={question.id}>
            <p className="font-body text-xs font-medium text-slate-600 mb-1">
              {question.question}
            </p>
            <p className="font-body text-sm text-slate-900">
              {answers[question.id.toString()] || "No answer"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
