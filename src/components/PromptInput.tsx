'use client';

import React, { useState, KeyboardEvent } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
  selectedCount: number;
}

const PRESET_PROMPTS = [
  {
    label: '🏦 Explain UPI Flow',
    prompt:
      'Explain how UPI (Unified Payments Interface) works in simple terms, with an example transaction flow.',
  },
  {
    label: '💻 TypeScript Debounce',
    prompt:
      'Write a clean, production-ready TypeScript debounce function with cancel() method and immediate execution option.',
  },
  {
    label: '🧠 Quantum Computing (Eli5)',
    prompt:
      'Explain quantum computing and superposition to a curious 10-year-old using simple everyday analogies.',
  },
  {
    label: '🚀 Vision vs Roadmap',
    prompt:
      'What is the fundamental difference between Product Vision, Product Strategy, and Product Roadmap? Provide a clear comparison table.',
  },
];

export const PromptInput: React.FC<PromptInputProps> = ({
  onSubmit,
  isLoading,
  selectedCount,
}) => {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (!text.trim() || isLoading) return;
    onSubmit(text.trim());
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePresetClick = (presetPrompt: string) => {
    setText(presetPrompt);
    onSubmit(presetPrompt);
  };

  return (
    <div className="w-full space-y-3">
      {/* Preset pills */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <span className="flex items-center gap-1 text-xs font-medium text-zinc-400">
          <Sparkles className="h-3 w-3 text-indigo-400" />
          Try:
        </span>
        {PRESET_PROMPTS.map((item, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isLoading}
            onClick={() => handlePresetClick(item.prompt)}
            className="rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1 text-xs font-medium text-zinc-300 transition-all hover:border-indigo-500/50 hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Input container */}
      <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/90 p-2 shadow-2xl backdrop-blur-xl transition-all focus-within:border-indigo-500/70 focus-within:ring-2 focus-within:ring-indigo-500/20">
        <textarea
          rows={3}
          value={text}
          disabled={isLoading}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything (e.g. explain a concept, compare coding solutions, solve a logic puzzle)..."
          className="w-full resize-none bg-transparent px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none sm:text-base"
        />

        <div className="flex items-center justify-between border-t border-zinc-800/80 px-2 pt-2">
          <div className="text-xs text-zinc-400">
            Press <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300 font-mono text-[10px]">Enter ↵</kbd> to race {selectedCount} models in parallel
          </div>

          <button
            type="button"
            disabled={!text.trim() || isLoading}
            onClick={handleSubmit}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:brightness-110 hover:shadow-indigo-600/50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Racing Models...</span>
              </>
            ) : (
              <>
                <span>Compare Now</span>
                <Send className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
