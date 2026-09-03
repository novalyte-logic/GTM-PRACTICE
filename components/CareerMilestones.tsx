'use client';

import React, { useState, useMemo } from 'react';
import { 
  Award, 
  Zap, 
  Activity, 
  Timer, 
  ShieldAlert, 
  Layers, 
  Sparkles, 
  HeartHandshake, 
  Flame, 
  Database, 
  CheckCircle2, 
  Lock, 
  ArrowUpRight,
  Trophy,
  Filter,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CareerBadge, MockInterviewSession, CandidateAnswerRecord } from '@/lib/types';
import { computeCareerBadges } from '@/lib/achievements';

interface CareerMilestonesProps {
  sessions: MockInterviewSession[];
  completedAnswers: CandidateAnswerRecord[];
  completedScenarioCount?: number;
  onNavigateToSimulator?: () => void;
  onNavigateToScenarios?: () => void;
}

export const CareerMilestones: React.FC<CareerMilestonesProps> = ({
  sessions,
  completedAnswers,
  completedScenarioCount = 0,
  onNavigateToSimulator,
  onNavigateToScenarios
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterUnlockedOnly, setFilterUnlockedOnly] = useState<boolean>(false);

  const { badges, totalPoints, unlockedCount, nextRank } = useMemo(() => {
    return computeCareerBadges(sessions, completedAnswers, completedScenarioCount);
  }, [sessions, completedAnswers, completedScenarioCount]);

  const filteredBadges = useMemo(() => {
    return badges.filter((b) => {
      if (filterUnlockedOnly && !b.isUnlocked) return false;
      if (filterCategory !== 'all' && b.category !== filterCategory) return false;
      return true;
    });
  }, [badges, filterCategory, filterUnlockedOnly]);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap':
        return <Zap className="h-5 w-5 text-amber-500" />;
      case 'Activity':
        return <Activity className="h-5 w-5 text-emerald-500" />;
      case 'Timer':
        return <Timer className="h-5 w-5 text-indigo-500" />;
      case 'ShieldAlert':
        return <ShieldAlert className="h-5 w-5 text-rose-500" />;
      case 'Layers':
        return <Layers className="h-5 w-5 text-blue-500" />;
      case 'Sparkles':
        return <Sparkles className="h-5 w-5 text-purple-500" />;
      case 'HeartHandshake':
        return <HeartHandshake className="h-5 w-5 text-rose-500" />;
      case 'Flame':
        return <Flame className="h-5 w-5 text-orange-500" />;
      case 'Award':
        return <Award className="h-5 w-5 text-amber-500" />;
      case 'Database':
        return <Database className="h-5 w-5 text-teal-500" />;
      default:
        return <Trophy className="h-5 w-5 text-amber-500" />;
    }
  };

  const handleCelebrate = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#6366f1', '#ec4899']
      });
    } catch (_) {}
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Rank Card */}
      <div className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-2xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 border border-amber-200/80 px-2.5 py-1 text-xs font-bold text-amber-900">
              <Trophy className="h-3.5 w-3.5 text-amber-600" />
              <span>Career Milestones &amp; Achievement System</span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">
              GTM Engineering Readiness Badges
            </h2>
            <p className="text-xs text-stone-600 max-w-3xl leading-relaxed">
              Unlock prestigious competency badges as you practice real-world system architecture drills, master governor limit mitigations, and refine post-session calibration.
            </p>
          </div>

          <button
            onClick={handleCelebrate}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-300 px-4 py-2.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition shadow-2xs"
          >
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span>Celebrate Progress</span>
          </button>
        </div>

        {/* Rank & Points Progression Box */}
        <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-900 text-amber-400 font-bold shadow-2xs">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] text-stone-500 font-bold uppercase">Current Candidate Level</div>
                <div className="text-sm font-bold text-stone-900">{nextRank.name}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-right">
              <div>
                <div className="text-[10px] text-stone-500 font-bold uppercase">Total Points</div>
                <div className="text-sm font-bold text-amber-600 font-mono">{totalPoints} PTS</div>
              </div>
              <div>
                <div className="text-[10px] text-stone-500 font-bold uppercase">Badges Unlocked</div>
                <div className="text-sm font-bold text-stone-900">{unlockedCount} / {badges.length}</div>
              </div>
            </div>
          </div>

          {/* Progress Bar towards Next Rank */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-stone-600">
              <span>Next Milestone Progression</span>
              <span>{nextRank.currentPoints} / {nextRank.targetPoints} PTS ({nextRank.progressPercent}%)</span>
            </div>
            <div className="h-2 w-full rounded-full bg-stone-200 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 via-emerald-500 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${nextRank.progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {['all', 'Milestones & Consistency', 'Technical Architecture', 'Incident Triage & Speed', 'Mindset & Calibration'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  filterCategory === cat
                    ? 'bg-stone-900 text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {cat === 'all' ? 'All Badges' : cat}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 cursor-pointer font-semibold text-stone-700">
            <input
              type="checkbox"
              checked={filterUnlockedOnly}
              onChange={(e) => setFilterUnlockedOnly(e.target.checked)}
              className="rounded border-stone-300 text-stone-900 focus:ring-stone-500 h-3.5 w-3.5"
            />
            <span>Unlocked Only ({unlockedCount})</span>
          </label>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBadges.map((badge) => {
          const isUnlocked = badge.isUnlocked;
          return (
            <div
              key={badge.id}
              className={`rounded-2xl border p-5 space-y-3 transition-all ${
                isUnlocked
                  ? 'border-amber-200 bg-white shadow-sm hover:border-amber-300'
                  : 'border-stone-200 bg-stone-50/50 opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                  isUnlocked
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-stone-200/70 border-stone-300 text-stone-400'
                }`}>
                  {isUnlocked ? getIcon(badge.iconName) : <Lock className="h-4 w-4 text-stone-400" />}
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isUnlocked
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-stone-200 text-stone-600'
                  }`}>
                    {isUnlocked ? 'Unlocked' : 'In Progress'}
                  </span>
                  <span className="font-mono text-xs font-bold text-amber-600">
                    +{badge.points} PTS
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-stone-900 text-sm">{badge.title}</h3>
                <p className="text-xs text-stone-600 leading-relaxed font-medium">{badge.description}</p>
              </div>

              {/* Criteria & Progress Bar */}
              <div className="space-y-1.5 pt-2 border-t border-stone-100 text-xs">
                <div className="flex items-center justify-between text-[10px] text-stone-500 font-semibold">
                  <span>Criteria: {badge.criteriaDescription}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold text-stone-700">
                  <span>Progress</span>
                  <span>{badge.progress.current} / {badge.progress.target} {badge.progress.unit}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-stone-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isUnlocked ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{
                      width: `${Math.min(100, Math.round((badge.progress.current / badge.progress.target) * 100))}%`
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
