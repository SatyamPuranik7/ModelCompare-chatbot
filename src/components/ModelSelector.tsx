'use client';

import React from 'react';
import { AVAILABLE_MODELS } from '@/lib/models';
import { Check, Info, Sparkles, Cpu } from 'lucide-react';

interface ModelSelectorProps {
  selectedModelIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModelIds,
  onChange,
  disabled = false,
}) => {
  const toggleModel = (id: string) => {
    if (disabled) return;
    if (selectedModelIds.includes(id)) {
      if (selectedModelIds.length <= 2) {
        // Must keep at least 2 models
        return;
      }
      onChange(selectedModelIds.filter((m) => m !== id));
    } else {
      if (selectedModelIds.length >= 4) {
        // Max 4 models for clean side-by-side comparison & speed
        return;
      }
      onChange([...selectedModelIds, id]);
    }
  };

  const freeModels = AVAILABLE_MODELS.filter((m) => m.isFree);

  return (
    <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 backdrop-blur-sm sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-zinc-100 sm:text-base">
              Select Competitor Models ({selectedModelIds.length}/4 Selected)
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Pick 2 to 4 free AI models to run simultaneously against your prompt.
          </p>
        </div>

        {/* Quick select presets */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() =>
              onChange([
                'google/gemini-2.0-flash-exp:free',
                'meta-llama/llama-3.3-70b-instruct:free',
                'deepseek/deepseek-r1:free',
              ])
            }
            className="rounded-md bg-zinc-800/80 px-2.5 py-1 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
          >
            Big 3 (Free)
          </button>
          <button
            type="button"
            onClick={() =>
              onChange([
                'qwen/qwen-2.5-coder-32b-instruct:free',
                'deepseek/deepseek-r1:free',
                'meta-llama/llama-3.3-70b-instruct:free',
              ])
            }
            className="rounded-md bg-zinc-800/80 px-2.5 py-1 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
          >
            Code & Logic
          </button>
        </div>
      </div>

      {/* Model Grid */}
      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {freeModels.map((model) => {
          const isSelected = selectedModelIds.includes(model.id);
          return (
            <button
              key={model.id}
              type="button"
              disabled={disabled}
              onClick={() => toggleModel(model.id)}
              className={`group relative flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all duration-200 ${
                isSelected
                  ? 'border-indigo-500/80 bg-gradient-to-b from-indigo-950/40 to-zinc-900 shadow-md shadow-indigo-950/30 ring-1 ring-indigo-500/50'
                  : 'border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/80'
              } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
            >
              {/* Header with checkmark */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-3 w-3 rounded-full bg-gradient-to-r ${model.avatarColor}`}
                  />
                  <span className="text-xs font-semibold text-zinc-200">
                    {model.provider}
                  </span>
                </div>
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-md border text-xs transition-colors ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-600 text-white'
                      : 'border-zinc-700 bg-zinc-800/60 text-transparent group-hover:border-zinc-600'
                  }`}
                >
                  <Check className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Title & Badge */}
              <div className="mt-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-sm text-zinc-100">{model.name}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-zinc-400">
                  {model.description}
                </p>
              </div>

              {/* Footer Pills */}
              <div className="mt-3 flex items-center justify-between border-t border-zinc-800/60 pt-2.5 text-[11px]">
                <span className="rounded bg-emerald-950/70 px-1.5 py-0.5 font-medium text-emerald-400 ring-1 ring-emerald-500/20">
                  $0.00 Free
                </span>
                <span className="text-zinc-400 font-medium">{model.badge}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
