'use client';

import React, { useState } from 'react';
import { AVAILABLE_MODELS, DEFAULT_EVALUATOR_MODEL } from '@/lib/models';
import { X, Key, ShieldCheck, ExternalLink, Save, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  evaluatorModelId: string;
  onSaveEvaluatorModel: (id: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  evaluatorModelId,
  onSaveEvaluatorModel,
}) => {
  const [inputKey, setInputKey] = useState(apiKey);
  const [selectedEvaluator, setSelectedEvaluator] = useState(evaluatorModelId || DEFAULT_EVALUATOR_MODEL);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKey(inputKey.trim());
    onSaveEvaluatorModel(selectedEvaluator);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  const freeModels = AVAILABLE_MODELS.filter((m) => m.isFree);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Settings & Free API Keys</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* Zero Cost Info Box */}
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3.5">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              100% Free Guarantee ($0 Cost)
            </div>
            <p className="mt-1 text-xs text-zinc-300 leading-relaxed">
              OpenRouter offers completely free models with <strong>$0 cost</strong> and no credit card required. You can also leave this empty to use the built-in instant simulation mode!
            </p>
          </div>

          {/* API Key Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300">
                OpenRouter API Key (Optional)
              </label>
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:underline"
              >
                <span>Get Free Key (openrouter.ai)</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <p className="text-[11px] text-zinc-400">
              Saved locally in your browser. Never shared with any third party.
            </p>
          </div>

          {/* Evaluator Judge Model */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Select Judge / Evaluator Model
            </label>
            <select
              value={selectedEvaluator}
              onChange={(e) => setSelectedEvaluator(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-xs text-zinc-200 outline-none focus:border-indigo-500"
            >
              {freeModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.provider}) - Free
                </option>
              ))}
            </select>
            <p className="text-[11px] text-zinc-400">
              The judge model evaluates and scores all competitor answers objectively.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            <span>{saved ? 'Saved!' : 'Save Preferences'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
