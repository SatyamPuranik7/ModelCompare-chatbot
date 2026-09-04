'use client';

import React from 'react';
import { Sparkles, ShieldCheck, Settings, Share2, Award, Zap } from 'lucide-react';

interface HeaderProps {
  isDemo: boolean;
  setIsDemo: (val: boolean) => void;
  onOpenSettings: () => void;
  onOpenShare: () => void;
  hasResult: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isDemo,
  setIsDemo,
  onOpenSettings,
  onOpenShare,
  hasResult,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/25">
            <Award className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl">
                Model<span className="text-indigo-400">Compare</span>
              </h1>
              <span className="hidden items-center gap-1 rounded-full bg-emerald-950/60 px-2 py-0.5 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/30 sm:inline-flex">
                <ShieldCheck className="h-3 w-3" />
                100% Free ($0)
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">
              Parallel Multi-LLM Arena & Automated Judge
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mode Badge / Toggle */}
          <button
            onClick={() => setIsDemo(!isDemo)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
              isDemo
                ? 'bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30 hover:bg-amber-500/20'
                : 'bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-500/30 hover:bg-indigo-500/20'
            }`}
            title="Toggle between Instant Demo Mode and Live API Mode"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">{isDemo ? 'Demo Mode (Free)' : 'Live API Mode'}</span>
          </button>

          {/* Share Button */}
          <button
            onClick={onOpenShare}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 ring-1 ring-zinc-800 transition-colors hover:bg-zinc-800 hover:text-white"
            title="Share this comparison with friends"
          >
            <Share2 className="h-3.5 w-3.5 text-indigo-400" />
            <span>Share</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-zinc-300 ring-1 ring-zinc-800 transition-colors hover:bg-zinc-800 hover:text-white"
            title="Settings & API Keys"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
