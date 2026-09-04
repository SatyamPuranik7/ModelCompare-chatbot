'use client';

import React, { useState } from 'react';
import { ComparisonResult } from '@/lib/types';
import { X, Copy, Check, Globe, Share2, Rocket } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ComparisonResult | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, result }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopySummary = () => {
    if (!result) return;
    const lines = [
      `🤖 **ModelCompare AI Leaderboard**`,
      `**Question:** "${result.prompt}"`,
      ``,
      `🏆 **1st Place:** ${result.evaluations[0]?.modelName} (${result.evaluations[0]?.overallScore}/10)`,
      result.evaluations[1] ? `🥈 **2nd Place:** ${result.evaluations[1]?.modelName} (${result.evaluations[1]?.overallScore}/10)` : '',
      result.evaluations[2] ? `🥉 **3rd Place:** ${result.evaluations[2]?.modelName} (${result.evaluations[2]?.overallScore}/10)` : '',
      ``,
      `*Rationale:* ${result.winnerRationale}`,
      ``,
      `Compare multiple models concurrently at $0 cost on ModelCompare!`,
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(lines);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Share Comparison</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* Share App Link */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Share Direct App Link
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2">
              <Globe className="h-4 w-4 text-zinc-500 shrink-0" />
              <input
                readOnly
                value={currentUrl}
                className="w-full bg-transparent text-xs text-zinc-300 outline-none truncate"
              />
              <button
                onClick={handleCopyLink}
                className="flex shrink-0 items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Copy Leaderboard Summary */}
          {result && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Copy Leaderboard Summary (for WhatsApp, Slack, Twitter)
              </label>
              <button
                onClick={handleCopySummary}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-800/60 p-2.5 text-xs font-semibold text-zinc-200 transition-colors hover:bg-zinc-800 hover:text-white"
              >
                {copiedSummary ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-400">Copied Summary to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-indigo-400" />
                    <span>Copy Formatted Result Card</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* 100% Free Public Deployment Guide */}
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
              <Rocket className="h-4 w-4 text-indigo-400" />
              Host Live For Everyone (100% Free)
            </div>
            <p className="mt-1 text-xs leading-relaxed text-zinc-400">
              Want friends to access your app from anywhere in the world on a public URL?
              Deploy it to <strong>Vercel</strong> for $0 by pushing to GitHub and importing into Vercel.
              Your friends can immediately try it with zero setup!
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:bg-zinc-700 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
