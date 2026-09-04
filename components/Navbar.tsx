'use client';

import React, { useState } from 'react';
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
  Flame,
  Layers,
  Clock,
  CreditCard,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Sun,
  Moon
} from 'lucide-react';
import { PanicButton } from '@/components/PanicButton';

export type AppTab = 
  | 'simulator' 
  | 'topic-focus'
  | 'flashcards'
  | 'jargon-buster'
  | 'big-five'
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
  activeSessionTitle?: string;
  isSaved?: boolean;
  sessionElapsedSeconds?: number;
  onResumeLastSession?: () => void;
  hasResumableSession?: boolean;
  // Countdown Timer props
  countdownTargetMinutes?: number;
  countdownRemainingSeconds?: number;
  isCountdownRunning?: boolean;
  onSetCountdownTarget?: (minutes: number) => void;
  onToggleCountdown?: () => void;
  onResetCountdown?: () => void;
  onAddCountdownBuffer?: (minutes: number) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
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
  activeSessionTitle,
  isSaved,
  sessionElapsedSeconds,
  onResumeLastSession,
  hasResumableSession,
  countdownTargetMinutes = 30,
  countdownRemainingSeconds = 30 * 60,
  isCountdownRunning = false,
  onSetCountdownTarget,
  onToggleCountdown,
  onResetCountdown,
  onAddCountdownBuffer,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [showTimerSettings, setShowTimerSettings] = useState<boolean>(false);

  // Gentle visual alert condition: timer is running and time remaining is <= 5 minutes (300s)
  const isTimeRunningLow = isCountdownRunning && countdownRemainingSeconds <= 300 && countdownRemainingSeconds > 0;
  const isTimeExpired = isCountdownRunning && countdownRemainingSeconds <= 0;

  const formatCountdown = (totalSec: number) => {
    const isNeg = totalSec < 0;
    const absSec = Math.abs(totalSec);
    const mins = Math.floor(absSec / 60);
    const secs = absSec % 60;
    return `${isNeg ? '-' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
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
            onClick={() => setActiveTab('topic-focus')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'topic-focus'
                ? 'bg-white text-stone-900 shadow-2xs border border-stone-200/80 font-bold ring-1 ring-emerald-500/30'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <Target className="h-3.5 w-3.5 text-emerald-600" />
            <span>🎯 Topic Focus</span>
          </button>

          <button
            onClick={() => setActiveTab('flashcards')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'flashcards'
                ? 'bg-white text-stone-900 shadow-2xs border border-stone-200/80 font-bold ring-1 ring-indigo-500/30'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <CreditCard className="h-3.5 w-3.5 text-indigo-600" />
            <span>🃏 Flashcards</span>
          </button>

          <button
            onClick={() => setActiveTab('jargon-buster')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'jargon-buster'
                ? 'bg-white text-stone-900 shadow-2xs border border-stone-200/80 font-bold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 text-amber-600" />
            <span>Jargon Buster</span>
          </button>

          <button
            onClick={() => setActiveTab('big-five')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'big-five'
                ? 'bg-white text-stone-900 shadow-2xs border border-stone-200/80 font-bold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-purple-600" />
            <span>Big 5 Architectures</span>
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

        {/* Right: Panic Button, Countdown Timer & Gentle Alert, Focus Mode & Audio */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Target Countdown Timer Pill & Gentle Low-Time Alert */}
          <div className="relative">
            <button
              onClick={() => setShowTimerSettings(!showTimerSettings)}
              title={
                isTimeRunningLow
                  ? `Time running low! ${formatCountdown(countdownRemainingSeconds)} remaining on ${countdownTargetMinutes}m target.`
                  : `Target Countdown Timer: ${formatCountdown(countdownRemainingSeconds)} remaining (${countdownTargetMinutes}m target). Click to adjust.`
              }
              className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 sm:px-3 py-1.5 text-xs font-bold transition shadow-xs cursor-pointer ${
                isTimeRunningLow
                  ? 'border-amber-400 bg-amber-50 text-amber-900 ring-2 ring-amber-300/80 animate-pulse'
                  : isTimeExpired
                  ? 'border-rose-400 bg-rose-50 text-rose-900 ring-2 ring-rose-300 animate-pulse'
                  : isCountdownRunning
                  ? 'border-stone-300 bg-stone-50 text-stone-800 hover:bg-stone-100'
                  : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
              }`}
            >
              {isTimeRunningLow ? (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
              ) : (
                <Clock className={`h-3.5 w-3.5 ${isCountdownRunning ? 'text-indigo-600' : 'text-stone-400'}`} />
              )}

              <span className="tabular-nums font-mono font-bold text-xs">
                {formatCountdown(countdownRemainingSeconds)}
              </span>

              {isTimeRunningLow ? (
                <span className="hidden sm:inline-flex items-center rounded-md bg-amber-200/90 px-1.5 py-0.2 text-[10px] font-extrabold text-amber-950 uppercase tracking-wide">
                  Low Time
                </span>
              ) : (
                <span className="hidden lg:inline text-[10px] text-stone-400 font-semibold">
                  ({countdownTargetMinutes}m)
                </span>
              )}
            </button>

            {/* Timer Settings Popover */}
            {showTimerSettings && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-stone-200 bg-white p-3.5 shadow-xl z-50 text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <span className="font-bold text-stone-900 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Interview Target Timer</span>
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">
                    {formatCountdown(countdownRemainingSeconds)}
                  </span>
                </div>

                {isTimeRunningLow && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-2 text-[11px] text-amber-900 font-medium flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    <span>Time is running low! Begin your wrap-up.</span>
                  </div>
                )}

                {/* Target Duration Selector Buttons: 30m and 60m */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-stone-500">Target Duration:</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => {
                        onSetCountdownTarget?.(30);
                        setShowTimerSettings(false);
                      }}
                      className={`rounded-lg py-1.5 px-2 text-xs font-bold border transition ${
                        countdownTargetMinutes === 30
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      30 Minutes
                      <span className="block text-[10px] font-normal text-stone-500">Technical Screen</span>
                    </button>

                    <button
                      onClick={() => {
                        onSetCountdownTarget?.(60);
                        setShowTimerSettings(false);
                      }}
                      className={`rounded-lg py-1.5 px-2 text-xs font-bold border transition ${
                        countdownTargetMinutes === 60
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      60 Minutes
                      <span className="block text-[10px] font-normal text-stone-500">Full System Loop</span>
                    </button>
                  </div>

                  {/* Secondary duration presets: 15m and 45m */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <button
                      onClick={() => {
                        onSetCountdownTarget?.(15);
                        setShowTimerSettings(false);
                      }}
                      className={`rounded-lg py-1 px-2 text-[11px] font-semibold border transition ${
                        countdownTargetMinutes === 15
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      15m Quick Drill
                    </button>

                    <button
                      onClick={() => {
                        onSetCountdownTarget?.(45);
                        setShowTimerSettings(false);
                      }}
                      className={`rounded-lg py-1 px-2 text-[11px] font-semibold border transition ${
                        countdownTargetMinutes === 45
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      45m Standard
                    </button>
                  </div>
                </div>

                {/* Timer Action Controls: Play/Pause, Reset, +5m Buffer */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100 gap-1.5">
                  <button
                    onClick={() => onToggleCountdown?.()}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold text-white transition ${
                      isCountdownRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-stone-900 hover:bg-stone-800'
                    }`}
                  >
                    {isCountdownRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    <span>{isCountdownRunning ? 'Pause' : 'Start'}</span>
                  </button>

                  <button
                    onClick={() => onAddCountdownBuffer?.(5)}
                    title="Add 5 minutes buffer"
                    className="flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 px-2 py-1.5 text-xs font-semibold text-stone-700 transition"
                  >
                    <Plus className="h-3 w-3" />
                    <span>+5m</span>
                  </button>

                  <button
                    onClick={() => onResetCountdown?.()}
                    title="Reset countdown to target time"
                    className="p-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-600 transition"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

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

          {/* Dark Mode Toggle Button */}
          <button
            onClick={onToggleDarkMode}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-all ${
              isDarkMode
                ? 'border-amber-300 bg-amber-500/20 text-amber-200 hover:bg-amber-500/35'
                : 'border-stone-200 bg-white text-stone-500 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            {isDarkMode ? <Sun className="h-4 w-4 text-amber-400 fill-amber-400" /> : <Moon className="h-4 w-4 text-stone-600" />}
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
          onClick={() => setActiveTab('topic-focus')}
          className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold ${
            activeTab === 'topic-focus' ? 'bg-stone-900 text-white font-bold' : 'bg-stone-100 text-stone-700 border border-stone-200'
          }`}
        >
          🎯 Topic Focus
        </button>
        <button
          onClick={() => setActiveTab('flashcards')}
          className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold ${
            activeTab === 'flashcards' ? 'bg-stone-900 text-white font-bold' : 'bg-stone-100 text-stone-700 border border-stone-200'
          }`}
        >
          🃏 Flashcards
        </button>
        <button
          onClick={() => setActiveTab('jargon-buster')}
          className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold ${
            activeTab === 'jargon-buster' ? 'bg-stone-900 text-white font-bold' : 'bg-stone-100 text-stone-700 border border-stone-200'
          }`}
        >
          Jargon Buster
        </button>
        <button
          onClick={() => setActiveTab('big-five')}
          className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold ${
            activeTab === 'big-five' ? 'bg-stone-900 text-white font-bold' : 'bg-stone-100 text-stone-700 border border-stone-200'
          }`}
        >
          Big 5
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
