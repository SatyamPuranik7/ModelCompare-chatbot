'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { ModelSelector } from '@/components/ModelSelector';
import { PromptInput } from '@/components/PromptInput';
import { PodiumCard } from '@/components/PodiumCard';
import { AnswerComparison } from '@/components/AnswerComparison';
import { ShareModal } from '@/components/ShareModal';
import { SettingsModal } from '@/components/SettingsModal';
import { ComparisonResult } from '@/lib/types';
import { DEFAULT_FREE_MODELS, DEFAULT_EVALUATOR_MODEL } from '@/lib/models';
import { MOCK_COMPARISONS } from '@/lib/mockData';
import { Sparkles, Trophy, Cpu, Zap, AlertCircle, RefreshCw } from 'lucide-react';

export default function Home() {
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>(DEFAULT_FREE_MODELS);
  const [result, setResult] = useState<ComparisonResult | null>(MOCK_COMPARISONS.default);
  const [activeModelId, setActiveModelId] = useState<string>(
    MOCK_COMPARISONS.default.evaluations[0]?.modelId || DEFAULT_FREE_MODELS[0]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(true);

  // Settings state
  const [apiKey, setApiKey] = useState('');
  const [evaluatorModelId, setEvaluatorModelId] = useState(DEFAULT_EVALUATOR_MODEL);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Load saved API key & settings on mount
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem('modelcompare_api_key');
      const savedEval = localStorage.getItem('modelcompare_eval_model');
      if (savedKey) {
        setApiKey(savedKey);
        setIsDemo(false);
      }
      if (savedEval) {
        setEvaluatorModelId(savedEval);
      }
    } catch {
      // ignore local storage errors
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    try {
      if (key) {
        localStorage.setItem('modelcompare_api_key', key);
        setIsDemo(false);
      } else {
        localStorage.removeItem('modelcompare_api_key');
      }
    } catch {
      // ignore
    }
  };

  const handleSaveEvaluatorModel = (id: string) => {
    setEvaluatorModelId(id);
    try {
      localStorage.setItem('modelcompare_eval_model', id);
    } catch {
      // ignore
    }
  };

  const handleRunComparison = async (promptText: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          modelIds: selectedModelIds,
          evaluatorModelId,
          userApiKey: apiKey,
          isDemo,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `Request failed with status ${res.status}`);
      }

      const data: ComparisonResult = await res.json();
      setResult(data);
      if (data.evaluations && data.evaluations.length > 0) {
        setActiveModelId(data.evaluations[0].modelId);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Comparison failed to complete.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navigation Bar */}
      <Header
        isDemo={isDemo}
        setIsDemo={setIsDemo}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
        hasResult={!!result}
      />

      {/* Main Container */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-2.5 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 ring-1 ring-indigo-500/30">
            <Sparkles className="h-3.5 w-3.5" />
            100% Free Multi-Model Comparison Engine
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Pit Top AI Models Against Each Other
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Send your question to Gemini, Llama, and DeepSeek in parallel. An independent
            AI judge evaluates accuracy, clarity, and reasoning to crown the winner.
          </p>
        </div>

        {/* Model Selector */}
        <ModelSelector
          selectedModelIds={selectedModelIds}
          onChange={setSelectedModelIds}
          disabled={isLoading}
        />

        {/* Prompt Input Area */}
        <PromptInput
          onSubmit={handleRunComparison}
          isLoading={isLoading}
          selectedCount={selectedModelIds.length}
        />

        {/* Error Alert */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-xs text-red-300 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold">Comparison Error:</span>
              <p>{error}</p>
              <p className="text-zinc-400">
                Tip: If using live API mode, check your OpenRouter key in Settings, or switch to Free Demo Mode.
              </p>
            </div>
          </div>
        )}

        {/* Loading State / Racing Indicator */}
        {isLoading && (
          <div className="rounded-2xl border border-indigo-500/30 bg-zinc-900/60 p-8 text-center backdrop-blur-sm space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                <Cpu className="h-7 w-7 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
              </div>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white">
                Racing {selectedModelIds.length} Models in Parallel...
              </h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Gathering responses simultaneously and submitting them to the LLM-as-a-Judge for multi-criteria evaluation.
              </p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {!isLoading && result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Question Recap */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-4">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                  Question Compared
                </span>
                <p className="text-sm font-medium text-zinc-200">
                  &ldquo;{result.prompt}&rdquo;
                </p>
              </div>
              <button
                onClick={() => handleRunComparison(result.prompt)}
                className="flex items-center gap-1.5 self-start sm:self-auto rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                Rerun Race
              </button>
            </div>

            {/* Podium & Leaderboard */}
            <PodiumCard
              evaluations={result.evaluations}
              responses={result.responses}
              winnerRationale={result.winnerRationale}
              activeModelId={activeModelId}
              onSelectModel={setActiveModelId}
            />

            {/* Side-by-Side / Tabbed Response Viewer */}
            <AnswerComparison
              responses={result.responses}
              evaluations={result.evaluations}
              activeModelId={activeModelId}
              onSelectModel={setActiveModelId}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-900 bg-zinc-950 py-6 text-center text-xs text-zinc-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>ModelCompare • Built with Next.js 15, OpenRouter Free Tier & Automated LLM Judges</span>
          <div className="flex items-center gap-4 text-zinc-400">
            <button onClick={() => setIsShareOpen(true)} className="hover:text-white transition-colors">
              Share With Friends
            </button>
            <span>•</span>
            <button onClick={() => setIsSettingsOpen(true)} className="hover:text-white transition-colors">
              API Keys ($0 Free)
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        result={result}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        evaluatorModelId={evaluatorModelId}
        onSaveEvaluatorModel={handleSaveEvaluatorModel}
      />
    </div>
  );
}
