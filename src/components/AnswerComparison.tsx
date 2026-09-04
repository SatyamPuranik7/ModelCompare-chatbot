'use client';

import React, { useState } from 'react';
import { ModelResponse, ModelEvaluation } from '@/lib/types';
import { Copy, Check, ThumbsUp, ThumbsDown, Trophy, Code2 } from 'lucide-react';

interface AnswerComparisonProps {
  responses: ModelResponse[];
  evaluations: ModelEvaluation[];
  activeModelId: string;
  onSelectModel: (id: string) => void;
}

export const AnswerComparison: React.FC<AnswerComparisonProps> = ({
  responses,
  evaluations,
  activeModelId,
  onSelectModel,
}) => {
  const [copied, setCopied] = useState(false);

  const activeResponse = responses.find((r) => r.modelId === activeModelId) || responses[0];
  const activeEval = evaluations.find((e) => e.modelId === activeModelId);

  const handleCopy = () => {
    if (!activeResponse?.content) return;
    navigator.clipboard.writeText(activeResponse.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to render markdown-like content cleanly
  const renderFormattedContent = (content: string) => {
    if (!content) {
      return (
        <div className="py-8 text-center text-sm text-zinc-500">
          No answer generated or request failed for this model.
        </div>
      );
    }

    const sections = content.split(/(```[\s\S]*?```)/g);

    return sections.map((section, idx) => {
      if (section.startsWith('```')) {
        const firstLineEnd = section.indexOf('\n');
        const lang = section.slice(3, firstLineEnd).trim() || 'text';
        const code = section.slice(firstLineEnd + 1, -3);

        return (
          <div key={idx} className="my-3 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/90 px-3.5 py-1.5 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase">
                <Code2 className="h-3.5 w-3.5 text-indigo-400" />
                {lang}
              </span>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-zinc-200">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Render standard text with headings and bold
      return (
        <div key={idx} className="space-y-2.5 text-sm leading-relaxed text-zinc-300">
          {section.split('\n\n').map((para, pIdx) => {
            const trimmed = para.trim();
            if (!trimmed) return null;

            if (trimmed.startsWith('### ')) {
              return (
                <h3 key={pIdx} className="text-base font-bold text-white pt-2">
                  {trimmed.replace('### ', '')}
                </h3>
              );
            }
            if (trimmed.startsWith('#### ')) {
              return (
                <h4 key={pIdx} className="text-sm font-semibold text-zinc-100 pt-1">
                  {trimmed.replace('#### ', '')}
                </h4>
              );
            }
            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
              const items = trimmed.split('\n');
              return (
                <ul key={pIdx} className="list-disc pl-5 space-y-1 text-zinc-300">
                  {items.map((it, itIdx) => (
                    <li key={itIdx}>{it.replace(/^[-*]\s*/, '')}</li>
                  ))}
                </ul>
              );
            }
            return <p key={pIdx} className="whitespace-pre-line">{trimmed}</p>;
          })}
        </div>
      );
    });
  };

  return (
    <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/70 backdrop-blur-md overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex overflow-x-auto border-b border-zinc-800 bg-zinc-950/60 p-1.5 scrollbar-none">
        {responses.map((resp) => {
          const ev = evaluations.find((e) => e.modelId === resp.modelId);
          const isSelected = activeModelId === resp.modelId;
          const isWinner = ev?.rank === 1;

          return (
            <button
              key={resp.modelId}
              onClick={() => onSelectModel(resp.modelId)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
              }`}
            >
              {isWinner && <Trophy className="h-3.5 w-3.5 text-amber-400" />}
              <span>{resp.modelName}</span>
              {ev && (
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    isWinner
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-zinc-800 text-zinc-300'
                  }`}
                >
                  {ev.overallScore}★
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Answer Content & Judge Analysis */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* Top bar with copy action */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div>
            <h3 className="font-bold text-base text-white">
              {activeResponse?.modelName}
            </h3>
            <p className="text-xs text-zinc-400">
              Provider: {activeResponse?.provider} • Latency: {activeResponse?.latencyMs ? `${activeResponse.latencyMs}ms` : 'N/A'}
            </p>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Answer</span>
              </>
            )}
          </button>
        </div>

        {/* Formatted Model Answer */}
        <div className="space-y-4">
          {renderFormattedContent(activeResponse?.content || '')}
        </div>

        {/* Judge Feedback Box */}
        {activeEval && (
          <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Judge Evaluation for {activeEval.modelName}
            </h4>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Strengths */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  Key Strengths
                </div>
                <ul className="list-disc pl-4 text-xs text-zinc-300 space-y-1">
                  {activeEval.strengths.map((str, idx) => (
                    <li key={idx}>{str}</li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses / Suggestions */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                  <ThumbsDown className="h-3.5 w-3.5" />
                  Points for Improvement
                </div>
                <ul className="list-disc pl-4 text-xs text-zinc-300 space-y-1">
                  {activeEval.weaknesses.map((weak, idx) => (
                    <li key={idx}>{weak}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
