"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { createLogger } from "@/lib/logger";
import type { Database } from "@/types/supabase";
import { LoadingState, ErrorState } from "@/components/common";

const logger = createLogger('SurveyResponse');

type Survey = Database["public"]["Tables"]["surveys"]["Row"];
type SurveyQuestion = Database["public"]["Tables"]["survey_questions"]["Row"];

// Get default org ID from environment or use fallback
const DEFAULT_ORG_ID = process.env.NEXT_PUBLIC_DEFAULT_ORG_ID || '00000000-0000-0000-0000-000000000001';

export default function SurveyResponsePage() {
  const params = useParams();
  const router = useRouter();
  const surveyId = params.surveyId as string;

  // Survey data state
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Fetch survey and questions on mount
  useEffect(() => {
    if (surveyId) {
      fetchSurveyData();
    }
  }, [surveyId]);

  const fetchSurveyData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Log survey response started
      logger.info('Survey response started', { surveyId });

      // Fetch survey details
      const { data: surveyData, error: surveyError } = await supabase
        .from("surveys")
        .select("*")
        .eq("id", surveyId)
        .single();

      if (surveyError) throw surveyError;

      if (!surveyData) {
        throw new Error("Survey not found");
      }

      // Fetch survey questions
      const { data: questionsData, error: questionsError } = await supabase
        .from("survey_questions")
        .select("*")
        .eq("survey_id", surveyId)
        .order("position", { ascending: true });

      if (questionsError) throw questionsError;

      setSurvey(surveyData);
      setQuestions(questionsData || []);

      logger.debug('Survey data loaded', { 
        surveyId, 
        title: surveyData.title,
        questionCount: questionsData?.length || 0 
      });

    } catch (err) {
      logger.error('Failed to load survey', err, { surveyId });
      setError("Failed to load survey. Please check the link and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers({
      ...answers,
      [questionId]: value,
    });
    
    // Clear validation error for this question
    if (validationErrors[questionId]) {
      const newErrors = { ...validationErrors };
      delete newErrors[questionId];
      setValidationErrors(newErrors);
    }
  };

  const validateAnswers = (): boolean => {
    const errors: Record<number, string> = {};
    
    // Check if all questions have answers (simplified validation)
    questions.forEach((question) => {
      if (!answers[question.id] || answers[question.id].trim() === "") {
        errors[question.id] = "This question is required";
      }
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      
      logger.warn('Survey response validation failed', { 
        surveyId, 
        errorCount: Object.keys(errors).length,
        missingQuestions: Object.keys(errors)
      });
      
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate answers
    if (!validateAnswers()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit response to database
      const { data: responseData, error: responseError } = await supabase
        .from("responses")
        .insert({
          survey_id: surveyId,
          org_id: DEFAULT_ORG_ID,
          answers: answers,
          sentiment: null, // Will be set by AI analysis
        })
        .select()
        .single();

      if (responseError) throw responseError;

      // Log successful submission
      logger.info('Survey response submitted', { 
        surveyId, 
        responseId: responseData.id,
        questionCount: Object.keys(answers).length
      });

      // Log to activity feed
      try {
        const { error: activityError } = await supabase
          .from("activity_feed")
          .insert({
            org_id: DEFAULT_ORG_ID,
            type: 'RESPONSE_RECEIVED',
            details: {
              survey_id: surveyId,
              survey_title: survey?.title || 'Unknown Survey',
              response_id: responseData.id,
            }
          });

        if (activityError) {
          logger.error('Failed to log to activity feed', activityError, { responseId: responseData.id });
        } else {
          logger.debug('Activity logged successfully', { type: 'RESPONSE_RECEIVED', responseId: responseData.id });
        }
      } catch (activityErr) {
        logger.error('Failed to log activity', activityErr);
      }

      // Trigger AI sentiment analysis (non-blocking)
      try {
        const analyzeResponse = await fetch('/api/openai/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            responseId: responseData.id,
            surveyId: surveyId,
            answers: answers,
          }),
        });

        if (!analyzeResponse.ok) {
          logger.warn('AI analysis request failed', { 
            responseId: responseData.id,
            status: analyzeResponse.status 
          });
        } else {
          const analyzeData = await analyzeResponse.json();
          logger.info('AI analysis completed', { 
            responseId: responseData.id,
            sentiment: analyzeData.analysis?.sentiment 
          });
        }
      } catch (analyzeErr) {
        // Don't block submission if analysis fails
        logger.error('AI analysis error (non-blocking)', analyzeErr, { responseId: responseData.id });
      }

      // Mark as submitted
      setIsSubmitted(true);

    } catch (err) {
      logger.error('Failed to submit survey response', err, { 
        surveyId,
        answerCount: Object.keys(answers).length
      });
      
      setError("Failed to submit your response. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return <LoadingState message="Loading survey..." />;
  }

  // Error state
  if (error) {
    return <ErrorState message={error} />;
  }

  // Survey not found
  if (!survey) {
    return <ErrorState message="Survey not found" />;
  }

  // Success state (after submission)
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 max-w-md w-full text-center">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-2">
            Thank You!
          </h2>
          <p className="font-body text-slate-600">
            Your response has been submitted successfully.
          </p>
        </div>
      </div>
    );
  }

  // Response form
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Survey Header */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 mb-6">
          <h1 className="font-heading text-3xl font-semibold text-slate-900 mb-2">
            {survey.title}
          </h1>
          {survey.description && (
            <p className="font-body text-slate-600 mt-2">
              {survey.description}
            </p>
          )}
          <div className="mt-4 text-sm text-slate-500">
            <span className="font-accent font-medium">Audience:</span> {survey.audience}
          </div>
        </div>

        {/* Questions Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((question, index) => (
            <div key={question.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <label className="block mb-4">
                <span className="font-body text-base font-medium text-slate-900 mb-2 block">
                  {index + 1}. {question.question}
                </span>
                
                {question.type === 'multiple_choice' && question.options ? (
                  <select
                    value={answers[question.id] || ""}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className={`w-full px-4 py-3 font-body text-base border rounded-lg focus:ring-2 focus:ring-[#2663EB] focus:border-transparent transition-all duration-200 ${
                      validationErrors[question.id] ? 'border-red-500' : 'border-slate-300'
                    }`}
                  >
                    <option value="">Select an option</option>
                    {question.options.map((option, i) => (
                      <option key={i} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : question.type === 'yes_no' ? (
                  <select
                    value={answers[question.id] || ""}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className={`w-full px-4 py-3 font-body text-base border rounded-lg focus:ring-2 focus:ring-[#2663EB] focus:border-transparent transition-all duration-200 ${
                      validationErrors[question.id] ? 'border-red-500' : 'border-slate-300'
                    }`}
                  >
                    <option value="">Select an option</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                ) : question.type === 'rating' ? (
                  <select
                    value={answers[question.id] || ""}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className={`w-full px-4 py-3 font-body text-base border rounded-lg focus:ring-2 focus:ring-[#2663EB] focus:border-transparent transition-all duration-200 ${
                      validationErrors[question.id] ? 'border-red-500' : 'border-slate-300'
                    }`}
                  >
                    <option value="">Select a rating</option>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <option key={rating} value={rating}>
                        {rating} - {rating === 1 ? 'Poor' : rating === 3 ? 'Average' : rating === 5 ? 'Excellent' : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <textarea
                    value={answers[question.id] || ""}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    rows={question.type === 'long_text' ? 4 : 2}
                    className={`w-full px-4 py-3 font-body text-base border rounded-lg focus:ring-2 focus:ring-[#2663EB] focus:border-transparent transition-all duration-200 resize-none ${
                      validationErrors[question.id] ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="Type your answer here..."
                  />
                )}
              </label>
              
              {validationErrors[question.id] && (
                <p className="text-sm text-red-600 mt-2">
                  {validationErrors[question.id]}
                </p>
              )}
            </div>
          ))}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-[#2663EB] text-white font-accent font-medium rounded-lg hover:bg-[#2054C8] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-95"
            >
              {isSubmitting ? "Submitting..." : "Submit Response"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

