'use client';

import React from 'react';
import { 
  Sparkles, 
  Terminal, 
  Activity, 
  FileText, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  Award, 
  ChevronRight,
  UserCheck,
  Target,
  BarChart3,
  Compass,
  Network,
  ListOrdered,
  Maximize2,
  Minimize2,
  Flame
} from 'lucide-react';
import { PanicButton } from '@/components/PanicButton';

export type AppTab = 
  | 'simulator' 
  | 'scenarios' 
  | 'daily-sim'
  | 'ecosystem'
  | 'benchmarks' 
  | 'trends' 
  | 'learning-path' 
  | 'history' 
  | 'cheatsheet';

interface NavbarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => void;
  totalAnswered: number;
  averageScore: number;
  onNewSession: () => void;
  focusMode: boolean;
  setFocusMode: (focus: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  audioEnabled,
  setAudioEnabled,
  totalAnswered,
  averageScore,
  onNewSession,
  focusMode,
  setFocusMode,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-[#fafaf9]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Left: Branding & Candidate Profile */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold shadow-xs">
            G
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-stone-900">
                GTM-Pulse Studio
              </h1>
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200">
                Interview Prep
              </span>
            </div>
            <p className="text-[11px] text-stone-500 hidden sm:block">
              GTM Systems Engineer • <span className="text-stone-700 font-medium">Applied AI & RevOps</span>
            </p>
          </div>
        </div>

        {/* Center: Navigation Tabs */}
        <nav className="hidden xl:flex items-center gap-1 rounded-xl bg-stone-100/80 p-1 border border-stone-200">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'simulator'
                ? 'bg-white text-stone-900 shadow-2xs border border-stone-200/80'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span>Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('scenarios')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'scenarios'
                ? 'bg-white text-stone-900 shadow-2xs border border-stone-200/80'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <Activity className="h-3.5 w-3.5 text-emerald-600" />
            <span>Scenario Lab</span>
          </button>

          <button
            onClick={() => setActiveTab('daily-sim')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'daily-sim'
                ? 'bg-white text-stone-900 shadow-2xs border border-stone-200/80'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <ListOrdered className="h-3.5 w-3.5 text-amber-600" />
            <span>Daily Work Sim</span>
          </button>

          <button
            onClick={() => setActiveTab('ecosystem')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'ecosystem'
                ? 'bg-white text-stone-900 shadow-2xs border border-stone-200/80'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <Network className="h-3.5 w-3.5 text-blue-600" />
            <span>Ecosystem Map</span>
          </button>

          <button
            onClick={() => setActiveTab('benchmarks')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'benchmarks'
                ? 'bg-white text-stone-900 shadow-2xs border border-stone-200/80'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <Award className="h-3.5 w-3.5 text-indigo-600" />
            <span>Rubrics & Radar</span>
          </button>

          <button
            onClick={() => setActiveTab('trends')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'trends'
                ? 'bg-white text-stone-900 shadow-2xs border border-stone-200/80'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Trends</span>
          </button>

          <button
            onClick={() => setActiveTab('learning-path')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'learning-path'
                ? 'bg-white text-stone-900 shadow-2xs border border-stone-200/80'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <Compass className="h-3.5 w-3.5 text-rose-600" />
            <span>Adaptive</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-white text-stone-900 shadow-2xs border border-stone-200/80'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <FileText className="h-3.5 w-3.5 text-purple-600" />
            <span>Reports</span>
          </button>

          <button
            onClick={() => setActiveTab('cheatsheet')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'cheatsheet'
                ? 'bg-white text-stone-900 shadow-2xs border border-stone-200/80'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 text-amber-600" />
            <span>Cheat Sheet</span>
          </button>
        </nav>

        {/* Right: Panic Button, Focus Mode Shortcut & Audio Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Panic Button Bailout */}
          <PanicButton className="hidden sm:inline-flex" />

          {/* Focus Mode Shortcut Button */}
          <button
            onClick={() => setFocusMode(!focusMode)}
            title={focusMode ? 'Exit Focus Mode (Esc or click)' : 'Enter Focus Mode (Alt+F)'}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition shadow-2xs ${
              focusMode
                ? 'border-indigo-500 bg-indigo-600 text-white'
                : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50 hover:text-stone-900'
            }`}
          >
            {focusMode ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5 text-indigo-600" />}
            <span className="hidden md:inline">{focusMode ? 'Exit Focus' : 'Focus Mode'}</span>
            <kbd className="hidden lg:inline-block rounded bg-stone-100 text-[10px] px-1 text-stone-500 border border-stone-200">
              Alt+F
            </kbd>
          </button>

          {totalAnswered > 0 && (
            <div className="hidden lg:flex items-center gap-3 border-r border-stone-200 pr-3 text-xs">
              <div>
                <span className="text-stone-500">Drilled:</span>{' '}
                <span className="font-bold text-stone-900">{totalAnswered}</span>
              </div>
              <div>
                <span className="text-stone-500">Avg Score:</span>{' '}
                <span className={`font-bold ${averageScore >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {averageScore}%
                </span>
              </div>
            </div>
          )}

          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            title={audioEnabled ? 'Voice readout enabled' : 'Voice readout muted'}
            className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-all ${
              audioEnabled
                ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                : 'border-stone-200 bg-white text-stone-500 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          <button
            onClick={onNewSession}
            className="inline-flex items-center gap-1 rounded-xl bg-stone-900 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-stone-800 transition"
          >
            <span>New Session</span>
            <ChevronRight className="h-3.5 w-3.5 opacity-60" />
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Sub-Navigation Bar */}
      <div className="flex xl:hidden overflow-x-auto border-t border-stone-200 px-4 py-2 gap-1.5 scrollbar-none bg-[#fafaf9]">
        <button
          onClick={() => setActiveTab('simulator')}
          className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold ${
            activeTab === 'simulator' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700 border border-stone-200'
          }`}
        >
          Simulator
        </button>
        <button
          onClick={() => setActiveTab('scenarios')}
          className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold ${
            activeTab === 'scenarios' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700 border border-stone-200'
          }`}
        >
          Scenarios
        </button>
        <button
          onClick={() => setActiveTab('daily-sim')}
          className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold ${
            activeTab === 'daily-sim' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700 border border-stone-200'
          }`}
        >
          Daily Work Sim
        </button>
        <button
          onClick={() => setActiveTab('ecosystem')}
          className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold ${
            activeTab === 'ecosystem' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700 border border-stone-200'
          }`}
        >
          Ecosystem Map
        </button>
        <button
          onClick={() => setActiveTab('benchmarks')}
          className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold ${
            activeTab === 'benchmarks' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700 border border-stone-200'
          }`}
        >
          Benchmarks
        </button>
        <button
          onClick={() => setActiveTab('trends')}
          className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold ${
            activeTab === 'trends' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700 border border-stone-200'
          }`}
        >
          Trends
        </button>
        <button
          onClick={() => setActiveTab('learning-path')}
          className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold ${
            activeTab === 'learning-path' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700 border border-stone-200'
          }`}
        >
          Adaptive
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold ${
            activeTab === 'history' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700 border border-stone-200'
          }`}
        >
          Reports
        </button>
        <button
          onClick={() => setActiveTab('cheatsheet')}
          className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold ${
            activeTab === 'cheatsheet' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700 border border-stone-200'
          }`}
        >
          Cheat Sheet
        </button>
      </div>
    </header>
  );
};
