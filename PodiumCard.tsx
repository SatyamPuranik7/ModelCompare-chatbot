'use client';

import React, { useEffect, useState } from 'react';
import { ModelEvaluation, ModelResponse } from '@/lib/types';
import { Trophy, Medal, Timer, Zap, ChevronDown, ChevronUp, Sparkles, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PodiumCardProps {
  evaluations: ModelEvaluation[];
  responses: ModelResponse[];
  winnerRationale: string;
  onSelectModel: (modelId: string) => void;
  activeModelId: string;
}

export const PodiumCard: React.FC<PodiumCardProps> = ({
  evaluations,
  responses,
  winnerRationale,
  onSelectModel,
  activeModelId,
}) => {
  const [showCriteria, setShowCriteria] = useState(false);

  useEffect(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#6366f1', '#a855f7', '#10b981', '#f59e0b'],
      });
    } catch {
      // ignore in environments without canvas
    }
  }, [evaluations]);

  const handleCardClick = (modelId: string) => {
    onSelectModel(modelId);
    const el = document.getElementById('answers-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getLatency = (modelId: string) => {
    const r = responses.find((resp) => resp.modelId === modelId);
    return r?.latencyMs ? `${(r.latencyMs / 1000).toFixed(2)}s` : 'N/A';
  };

  const getTokens = (modelId: string) => {
    const r = responses.find((resp) => resp.modelId === modelId);
    return r?.tokensUsed ? `${r.tokensUsed} tokens` : null;
  };

  const winnerModelId = evaluations[0]?.modelId;

  return (
    <div className="w-full space-y-4">
      {/* Winner Spotlight Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-zinc-900 to-indigo-950/40 p-4 shadow-xl backdrop-blur-md sm:p-6">
        <div className="absolute right-0 top-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-400 ring-1 ring-amber-500/30">
                <Trophy className="h-3.5 w-3.5" />
                VERDICT: 1ST PLACE WINNER
              </span>
              <span className="text-xs text-zinc-400">Automated LLM-as-a-Judge</span>
            </div>
            <h3 className="text-lg font-bold text-white sm:text-xl">
              {evaluations[0]?.modelName}
            </h3>
            <p className="text-sm leading-relaxed text-zinc-300">
              {winnerRationale}
            </p>

            {/* Quick jump to winner's answer */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => winnerModelId && handleCardClick(winnerModelId)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/20 px-3.5 py-1.5 text-xs font-bold text-amber-300 ring-1 ring-amber-500/40 transition-all hover:bg-amber-500/30"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Read Winner&apos;s Full Answer Below ↓</span>
              </button>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3 self-start sm:self-center">
            <div className="flex flex-col items-center rounded-xl bg-amber-500/10 px-4 py-2 ring-1 ring-amber-500/30">
              <span className="text-2xl font-extrabold text-amber-300">
                {evaluations[0]?.overallScore}
              </span>
              <span className="text-[10px] uppercase font-bold text-amber-400/80">
                Score / 10
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Cards Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {evaluations.slice(0, 3).map((ev, index) => {
          const isSelected = activeModelId === ev.modelId;
          const isWinner = index === 0;
          const isSecond = index === 1;

          const badgeColor = isWinner
            ? 'bg-amber-500/20 text-amber-300 ring-amber-500/30'
            : isSecond
            ? 'bg-zinc-400/20 text-zinc-200 ring-zinc-500/30'
            : 'bg-orange-700/20 text-orange-300 ring-orange-600/30';

          const rankIcon = isWinner ? (
            <Trophy className="h-4 w-4 text-amber-400" />
          ) : (
            <Medal className="h-4 w-4 text-zinc-300" />
          );

          return (
            <div
              key={ev.modelId}
              onClick={() => handleCardClick(ev.modelId)}
              className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
                isSelected
                  ? 'border-indigo-500 bg-zinc-900 ring-2 ring-indigo-500/40 shadow-lg'
                  : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <span
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${badgeColor}`}
                >
                  {rankIcon}
                  #{ev.rank} {isWinner ? 'Champion' : isSecond ? 'Runner-Up' : '3rd Place'}
                </span>
                <span className="text-xl font-black text-white">
                  {ev.overallScore}
                  <span className="text-xs font-normal text-zinc-400">/10</span>
                </span>
              </div>

              {/* Model Name */}
              <div className="mt-3">
                <h4 className="font-semibold text-sm text-zinc-100">{ev.modelName}</h4>
                <p className="mt-1 line-clamp-2 text-xs text-zinc-400">{ev.summary}</p>
              </div>

              {/* Metrics (Latency + Tokens) */}
              <div className="mt-3 flex items-center justify-between border-t border-zinc-800/80 pt-2.5 text-[11px] text-zinc-400">
                <span className="flex items-center gap-1">
                  <Timer className="h-3 w-3 text-indigo-400" />
                  {getLatency(ev.modelId)}
                </span>
                {getTokens(ev.modelId) && (
                  <span className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-emerald-400" />
                    {getTokens(ev.modelId)}
                  </span>
                )}
                <span className="font-semibold text-indigo-400 hover:underline">
                  View Answer ↓
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Criteria Breakdown Accordion */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3">
        <button
          type="button"
          onClick={() => setShowCriteria(!showCriteria)}
          className="flex w-full items-center justify-between text-xs font-medium text-zinc-300 hover:text-white"
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            Detailed Rubric Breakdown (Accuracy, Completeness, Clarity, Reasoning)
          </span>
          {showCriteria ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showCriteria && (
          <div className="mt-4 grid grid-cols-1 gap-4 border-t border-zinc-800 pt-3 text-xs sm:grid-cols-3">
            {evaluations.slice(0, 3).map((ev) => (
              <div key={ev.modelId} className="space-y-2 rounded-lg bg-zinc-950/50 p-3">
                <div className="font-semibold text-zinc-200">{ev.modelName}</div>
                {Object.entries(ev.criteria).map(([key, crit]) => (
                  <div key={key} className="space-y-0.5">
                    <div className="flex justify-between text-[11px] text-zinc-400">
                      <span>{crit.name}</span>
                      <span className="font-semibold text-zinc-200">{crit.score}/10</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                        style={{ width: `${crit.score * 10}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
