import { PlusIcon, TrashIcon, Bars3Icon } from "@heroicons/react/24/outline";
import type { Question, QuestionType } from "@/types/survey";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ─────────────────────────────────────────────
// Question Card Component
// ─────────────────────────────────────────────

interface QuestionCardProps {
  question: Question;
  index: number;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  deleteQuestion: (id: string) => void;
  addOption: (questionId: string) => void;
  updateOption: (questionId: string, optionIndex: number, value: string) => void;
  deleteOption: (questionId: string, optionIndex: number) => void;
}

export function QuestionCard({
  question,
  index,
  updateQuestion,
  deleteQuestion,
  addOption,
  updateOption,
  deleteOption,
}: QuestionCardProps) {
  // Setup sortable functionality
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg border border-slate-200 shadow-sm p-6"
    >
      {/* Question Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <button
            className="flex items-center gap-2 text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing touch-none"
            {...attributes}
            {...listeners}
          >
            <Bars3Icon className="w-5 h-5" />
            <span className="font-accent text-sm font-semibold">Q{index + 1}</span>
          </button>
          <div className="flex-1">
            <input
              type="text"
              value={question.text}
              onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
              placeholder="Enter your question..."
              className="w-full px-3 py-2 font-body text-base text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2663EB] focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>
        <button
          onClick={() => deleteQuestion(question.id)}
          className="ml-3 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Question Type Selector */}
      <div className="mb-4">
        <select
          value={question.type}
          onChange={(e) =>
            updateQuestion(question.id, { type: e.target.value as QuestionType })
          }
          className="px-3 py-2 font-accent text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2663EB] focus:border-transparent transition-all duration-200"
        >
          <option value="short_text">📝 Short Text</option>
          <option value="long_text">📄 Long Text</option>
          <option value="multiple_choice">☑️ Multiple Choice</option>
          <option value="rating">⭐ Rating Scale</option>
          <option value="yes_no">✓✗ Yes/No</option>
        </select>
      </div>

      {/* Multiple Choice Options */}
      {question.type === "multiple_choice" && question.options && (
        <div className="space-y-2 mb-4 pl-8">
          <p className="font-body text-sm text-slate-600 mb-2">Options:</p>
          {question.options.map((option, optionIndex) => (
            <div key={optionIndex} className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full border-2 border-slate-300 flex-shrink-0" />
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                className="flex-1 px-3 py-2 font-body text-sm text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2663EB] focus:border-transparent transition-all duration-200"
              />
              {question.options && question.options.length > 2 && (
                <button
                  onClick={() => deleteOption(question.id, optionIndex)}
                  className="p-1 text-slate-400 hover:text-red-500 transition-colors duration-200"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => addOption(question.id)}
            className="inline-flex items-center gap-1 px-3 py-1 text-[#2663EB] hover:bg-blue-50 font-accent text-sm font-medium rounded-lg transition-colors duration-200"
          >
            <PlusIcon className="w-4 h-4" />
            Add Option
          </button>
        </div>
      )}

      {/* Rating Preview */}
      {question.type === "rating" && (
        <div className="pl-8 mb-4">
          <p className="font-body text-sm text-slate-600 mb-2">Preview:</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <div
                key={star}
                className="w-10 h-10 rounded-lg border-2 border-slate-300 flex items-center justify-center font-accent text-sm font-semibold text-slate-600"
              >
                {star}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Yes/No Preview */}
      {question.type === "yes_no" && (
        <div className="pl-8 mb-4">
          <p className="font-body text-sm text-slate-600 mb-2">Preview:</p>
          <div className="flex gap-3">
            <div className="px-6 py-2 border-2 border-slate-300 rounded-lg font-accent text-sm font-medium">
              Yes
            </div>
            <div className="px-6 py-2 border-2 border-slate-300 rounded-lg font-accent text-sm font-medium">
              No
            </div>
          </div>
        </div>
      )}

      {/* Required Toggle */}
      <div className="flex items-center gap-2 pl-8">
        <input
          type="checkbox"
          id={`required-${question.id}`}
          checked={question.required}
          onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
          className="w-4 h-4 text-[#2663EB] border-slate-300 rounded focus:ring-2 focus:ring-[#2663EB]"
        />
        <label
          htmlFor={`required-${question.id}`}
          className="font-body text-sm text-slate-700"
        >
          Required question
        </label>
      </div>
    </div>
  );
}

