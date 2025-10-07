import { Sparkles, Clock } from 'lucide-react';
import { BoardSummary, AISuggestion } from '../types';

interface RightPanelProps {
  summary: BoardSummary | null;
  suggestions: AISuggestion[];
  onAcceptSuggestion: (suggestion: AISuggestion) => void;
}

export const RightPanel = ({ summary, suggestions, onAcceptSuggestion }: RightPanelProps) => {
  return (
    <div className="w-80 bg-white border-l border-slate-200 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-slate-800">AI Insights</h2>
          </div>

          {summary ? (
            <div className="space-y-4 mb-8">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <h3 className="font-medium text-slate-800 mb-2">Summary</h3>
                <p className="text-sm text-slate-700 leading-relaxed">{summary.summary_text}</p>
              </div>

              {summary.key_themes && summary.key_themes.length > 0 && (
                <div>
                  <h3 className="font-medium text-slate-800 mb-2 text-sm">Key Themes</h3>
                  <div className="flex flex-wrap gap-2">
                    {summary.key_themes.map((theme, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {summary.top_ideas && summary.top_ideas.length > 0 && (
                <div>
                  <h3 className="font-medium text-slate-800 mb-2 text-sm">Top Ideas</h3>
                  <ul className="space-y-2">
                    {summary.top_ideas.map((idea, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="text-blue-600 font-medium">{index + 1}.</span>
                        <span>{idea}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 rounded-lg p-6 text-center mb-8">
              <Sparkles className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600">
                Click "Summarize board" to generate AI insights
              </p>
            </div>
          )}

          {suggestions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-slate-600" />
                <h3 className="font-medium text-slate-800 text-sm">AI Suggestions</h3>
              </div>

              <div className="space-y-3">
                {suggestions.slice(0, 5).map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="bg-slate-50 rounded-lg p-3 border border-slate-200 hover:border-blue-300 transition-colors"
                  >
                    <p className="text-sm text-slate-700 mb-2">{suggestion.suggestion_text}</p>
                    {!suggestion.is_accepted && (
                      <button
                        onClick={() => onAcceptSuggestion(suggestion)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Add to board
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
