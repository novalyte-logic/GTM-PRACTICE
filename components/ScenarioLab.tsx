'use client';

import React, { useState } from 'react';
import { 
  Activity, 
  AlertOctagon, 
  CheckCircle2, 
  Terminal, 
  Cpu, 
  ArrowRight, 
  ShieldAlert, 
  Layers, 
  Database, 
  Flame, 
  RefreshCw,
  HelpCircle,
  FileCode,
  Sparkles,
  Award,
  Clock,
  ArrowUpRight,
  Zap,
  Sliders,
  Check,
  Dices,
  AlertTriangle,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GTMScenario, DifficultyLevel, GTMRoleProfile, WildcardConstraint } from '@/lib/types';
import { REAL_WORLD_SCENARIOS, WILDCARD_CONSTRAINTS } from '@/lib/mock-data';
import { MockCRMSandbox } from './MockCRMSandbox';
import { StepTooltip } from '@/components/StepTooltip';
import { PanicButton } from '@/components/PanicButton';

export const ScenarioLab: React.FC = () => {
  const [labMode, setLabMode] = useState<'scenarios' | 'crm-sandbox'>('scenarios');
  const [scenarioPool, setScenarioPool] = useState<GTMScenario[]>(REAL_WORLD_SCENARIOS);
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isOptionSubmitted, setIsOptionSubmitted] = useState<boolean>(false);
  const [completedScenarios, setCompletedScenarios] = useState<string[]>([]);
  const [isGeneratingScenario, setIsGeneratingScenario] = useState<boolean>(false);
  
  // Wildcard Constraint State
  const [activeWildcard, setActiveWildcard] = useState<WildcardConstraint | null>(null);
  const [showWildcardPicker, setShowWildcardPicker] = useState<boolean>(false);

  // Custom scenario creation state
  const [customRole, setCustomRole] = useState<GTMRoleProfile>('GTM Systems Engineer');
  const [customDifficulty, setCustomDifficulty] = useState<DifficultyLevel>('Senior GTM Engineer');

  const activeScenario: GTMScenario = scenarioPool[selectedScenarioIndex] || scenarioPool[0] || REAL_WORLD_SCENARIOS[0];
  const activeStep = activeScenario.steps[currentStepIndex] || activeScenario.steps[0];

  const handleSelectScenario = (index: number) => {
    setSelectedScenarioIndex(index);
    setCurrentStepIndex(0);
    setSelectedOptionId(null);
    setIsOptionSubmitted(false);
  };

  const handleOptionSelect = (optionId: string) => {
    if (isOptionSubmitted) return;
    setSelectedOptionId(optionId);
  };

  const handleSubmitOption = () => {
    if (!selectedOptionId) return;
    setIsOptionSubmitted(true);

    const chosenOption = activeStep.options?.find((o) => o.id === selectedOptionId);
    if (chosenOption?.isOptimal) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10b981', '#6366f1', '#f59e0b'],
        });
      } catch (_) {}
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < activeScenario.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsOptionSubmitted(false);
    } else {
      // Scenario Completed
      if (!completedScenarios.includes(activeScenario.id)) {
        setCompletedScenarios((prev) => [...prev, activeScenario.id]);
      }
    }
  };

  const handleInjectRandomWildcard = () => {
    const randomIndex = Math.floor(Math.random() * WILDCARD_CONSTRAINTS.length);
    setActiveWildcard(WILDCARD_CONSTRAINTS[randomIndex]);
    setShowWildcardPicker(false);
  };

  const handleSelectSpecificWildcard = (wc: WildcardConstraint) => {
    setActiveWildcard(wc);
    setShowWildcardPicker(false);
  };

  const handleClearWildcard = () => {
    setActiveWildcard(null);
  };

  // Generate dynamic custom troubleshooting scenario
  const handleGenerateScenario = async () => {
    setIsGeneratingScenario(true);
    try {
      const res = await fetch('/api/generate-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleProfile: customRole,
          difficulty: customDifficulty,
          topic: 'High-Scale Real-Time Ingress & Sync Resilience',
        }),
      });

      if (!res.ok) throw new Error('Failed to generate scenario');
      const newScenario: GTMScenario = await res.json();
      setScenarioPool([newScenario, ...scenarioPool]);
      setSelectedScenarioIndex(0);
      setCurrentStepIndex(0);
      setSelectedOptionId(null);
      setIsOptionSubmitted(false);
    } catch (e) {
      console.error(e);
      alert('Could not synthesize custom scenario. Using curated scenarios.');
    } finally {
      setIsGeneratingScenario(false);
    }
  };

  return (
    <div className="space-y-6 text-stone-800">
      {/* Top Navigation Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200/90 bg-white p-4 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLabMode('scenarios')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition shadow-2xs ${
              labMode === 'scenarios'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            <span>Incident Triage Drills ({scenarioPool.length})</span>
          </button>

          <button
            onClick={() => setLabMode('crm-sandbox')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition shadow-2xs ${
              labMode === 'crm-sandbox'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Cpu className="h-3.5 w-3.5 text-indigo-400" />
            <span>Interactive Mock CRM Sandbox</span>
            <span className="rounded-full bg-indigo-500/20 text-indigo-700 text-[10px] px-2 py-0.2 font-bold uppercase">
              Live Pipeline
            </span>
          </button>
        </div>

        <div className="text-xs text-stone-500 font-medium hidden sm:block">
          {labMode === 'scenarios' ? 'Step-by-step architectural disaster recovery' : 'Real-time webhook & governor limit simulation'}
        </div>
      </div>

      {labMode === 'crm-sandbox' ? (
        <MockCRMSandbox />
      ) : (
        <>
          {/* Top Scenario Selector & Generator */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <StepTooltip stepNumber={6} badgeLabel="Step 6: Incident Triage" />
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                    <Activity className="h-3.5 w-3.5 text-emerald-600" />
                    Live Incident & Scenario Lab
                  </span>
                  <span className="text-xs text-stone-500 hidden sm:inline">
                    Architectural Breakdown & Triage Engine
                  </span>
                </div>
                <h2 className="text-base font-bold text-stone-900 mt-1">
                  GTM System Breakdowns & Multi-SaaS Architecture Drills
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Simulate high-stakes production outages, broken webhook cascades, bi-directional sync loops, and enterprise integrations.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Wildcard Injector Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowWildcardPicker(!showWildcardPicker)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition shadow-2xs"
                  >
                    <Dices className="h-3.5 w-3.5 text-amber-600" />
                    <span>{activeWildcard ? 'Change Wildcard' : '🎲 Inject Wildcard'}</span>
                  </button>

                  {/* Wildcard Picker Dropdown */}
                  {showWildcardPicker && (
                    <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-stone-200 bg-white p-3 shadow-xl z-50 space-y-2 animate-in fade-in">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                        <span className="text-xs font-bold text-stone-900">
                          Inject Production Wildcard
                        </span>
                        <button
                          onClick={handleInjectRandomWildcard}
                          className="rounded-lg bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-900 hover:bg-amber-200"
                        >
                          🎲 Randomize
                        </button>
                      </div>

                      <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 text-xs">
                        {WILDCARD_CONSTRAINTS.map((wc) => (
                          <button
                            key={wc.id}
                            onClick={() => handleSelectSpecificWildcard(wc)}
                            className="w-full text-left rounded-xl p-2 hover:bg-stone-50 border border-stone-100 transition space-y-0.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-stone-900 text-[11px]">{wc.title}</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                wc.severity === 'Critical' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {wc.severity}
                              </span>
                            </div>
                            <p className="text-[10px] text-stone-500 line-clamp-1">{wc.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <PanicButton 
                  currentTrack="real-world-scenario"
                  currentQuestionTitle={activeScenario.title}
                />

                <button
                  onClick={handleGenerateScenario}
                  disabled={isGeneratingScenario}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{isGeneratingScenario ? 'Synthesizing Scenario...' : 'Generate New Incident'}</span>
                </button>
              </div>
            </div>

            {/* Scenario Tabs */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-100">
              {scenarioPool.map((sc, idx) => (
                <button
                  key={sc.id}
                  onClick={() => handleSelectScenario(idx)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    selectedScenarioIndex === idx
                      ? 'bg-stone-900 text-white shadow-2xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {completedScenarios.includes(sc.id) && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  )}
                  <span>{sc.title.split(' ')[0]} {sc.title.split(' ')[1] || 'Incident'}</span>
                </button>
              ))}
            </div>
          </div>

      {/* Injected Wildcard Alert Banner (if active) */}
      {activeWildcard && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50/90 p-4 shadow-xs space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-200 text-amber-900 font-bold text-xs">
                🎲
              </span>
              <span className="font-bold text-xs text-amber-950 uppercase tracking-wider">
                Active Wildcard Constraint: {activeWildcard.title}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                activeWildcard.severity === 'Critical' ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
              }`}>
                {activeWildcard.severity} Severity
              </span>
            </div>

            <button
              onClick={handleClearWildcard}
              className="text-stone-400 hover:text-stone-700 p-1"
              title="Remove Wildcard"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-xs text-amber-900 font-medium">
            {activeWildcard.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
            <div className="rounded-lg bg-white/80 p-2 border border-amber-200/70 text-amber-950">
              <span className="font-bold text-amber-900">Production Impact: </span>
              {activeWildcard.impact}
            </div>
            <div className="rounded-lg bg-white/80 p-2 border border-amber-200/70 text-amber-950">
              <span className="font-bold text-indigo-700">Architectural Expectation: </span>
              {activeWildcard.architecturalMitigationHint}
            </div>
          </div>
        </div>
      )}

      {/* Incident Overview Card */}
      <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-200 pb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-rose-600 px-2 py-0.5 text-xs font-bold text-white uppercase tracking-wider">
              <Flame className="h-3.5 w-3.5" />
              Production Outage
            </span>
            <span className="text-xs font-bold text-stone-900">
              {activeScenario.company}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-white px-2 py-0.5 text-xs font-semibold text-rose-800 border border-rose-200">
              {activeScenario.category}
            </span>
            <span className="rounded-md bg-white px-2 py-0.5 text-xs font-bold text-stone-700 border border-stone-200">
              {activeScenario.difficulty}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-base font-bold text-stone-900">
            {activeScenario.title}
          </h3>
          <p className="text-xs text-stone-700 leading-relaxed">
            {activeScenario.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl bg-white p-3.5 border border-rose-200/80 space-y-1">
            <div className="font-bold text-rose-900 uppercase text-[10px] tracking-wider">
              Quantified Revenue & Pipeline Impact:
            </div>
            <div className="text-stone-800 font-medium leading-snug">
              {activeScenario.businessImpact}
            </div>
          </div>

          <div className="rounded-xl bg-white p-3.5 border border-rose-200/80 space-y-1">
            <div className="font-bold text-stone-800 uppercase text-[10px] tracking-wider">
              System Architecture Flow:
            </div>
            <div className="font-mono text-stone-700 text-[11px] leading-snug">
              {activeScenario.architectureDiagramSummary}
            </div>
          </div>
        </div>
      </div>

      {/* Production Telemetry Log Snippet */}
      {activeScenario.initialIncidentLog && (
        <div className="rounded-2xl border border-stone-800 bg-stone-950 p-4 text-xs font-mono text-stone-300 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 border-b border-stone-800 pb-2 text-[11px]">
            <div className="flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-rose-400" />
              <span>Real-Time Error Telemetry / CloudWatch Ingress Logs</span>
            </div>
            <span className="text-[10px] text-rose-400 font-semibold">HTTP 429 / Exception Triggered</span>
          </div>
          <pre className="whitespace-pre-wrap leading-relaxed text-[11px] text-rose-300/90 overflow-x-auto">
            {activeScenario.initialIncidentLog}
          </pre>
        </div>
      )}

      {/* Interactive Step Diagnostic Stage */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-xs font-bold text-indigo-700">
              Step {activeStep.stepNumber} of {activeScenario.steps.length}
            </span>
            <h4 className="text-sm font-bold text-stone-900">
              Architectural Decision & Diagnostic Triage
            </h4>
          </div>

          <div className="text-xs text-stone-500 font-medium">
            Progress: {Math.round(((currentStepIndex + (isOptionSubmitted ? 1 : 0)) / activeScenario.steps.length) * 100)}%
          </div>
        </div>

        {/* Diagnostic Prompt */}
        <div className="text-sm font-bold text-stone-900 leading-snug">
          {activeStep.prompt}
        </div>

        {/* Step System Artifact if any */}
        {activeStep.systemArtifacts && (
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-3.5 text-xs space-y-2 font-mono">
            {activeStep.systemArtifacts.logSnippet && (
              <div className="text-rose-700">
                <span className="font-bold text-stone-700">Error: </span>
                {activeStep.systemArtifacts.logSnippet}
              </div>
            )}
            {activeStep.systemArtifacts.jsonPayload && (
              <pre className="text-stone-800 text-[11px] overflow-x-auto bg-white p-2.5 rounded-lg border border-stone-200">
                {activeStep.systemArtifacts.jsonPayload}
              </pre>
            )}
            {activeStep.systemArtifacts.sqlQuery && (
              <pre className="text-indigo-900 text-[11px] overflow-x-auto bg-white p-2.5 rounded-lg border border-stone-200">
                {activeStep.systemArtifacts.sqlQuery}
              </pre>
            )}
          </div>
        )}

        {/* Diagnostic Options */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-stone-800">
            Select Your Recommended Technical Resolution Action:
          </div>
          <div className="space-y-2.5">
            {activeStep.options?.map((option) => {
              const isSelected = selectedOptionId === option.id;
              let style = 'border-stone-200 bg-stone-50/50 hover:bg-stone-50 hover:border-stone-300';
              if (isSelected && !isOptionSubmitted) {
                style = 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/20';
              }
              if (isOptionSubmitted) {
                if (option.isOptimal) {
                  style = 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20';
                } else if (isSelected && !option.isOptimal) {
                  style = 'border-rose-500 bg-rose-50/70';
                }
              }

              return (
                <div
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id)}
                  className={`cursor-pointer rounded-xl border p-4 text-xs transition space-y-2 ${style}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-bold text-stone-900 leading-snug">
                      {option.label}
                    </div>
                    {isOptionSubmitted && option.isOptimal && (
                      <span className="shrink-0 inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                        <Check className="h-3 w-3" />
                        Optimal Architecture
                      </span>
                    )}
                  </div>

                  {/* Post-submit explanation */}
                  {isOptionSubmitted && isSelected && (
                    <div className="pt-2 border-t border-stone-200/60 text-[11px] space-y-1">
                      <div className="font-bold text-stone-700">Evaluation Rationale:</div>
                      <p className="text-stone-600 leading-relaxed">
                        {option.explanation}
                      </p>
                      <div className="text-indigo-700 font-semibold pt-0.5">
                        Architectural Tradeoff: {option.technicalTradeoff}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-100">
          <div className="text-xs text-stone-500">
            {!isOptionSubmitted ? 'Select an architectural action to test your hypothesis' : 'Review the feedback and proceed to next step'}
          </div>

          <div className="flex gap-2">
            {!isOptionSubmitted ? (
              <button
                disabled={!selectedOptionId}
                onClick={handleSubmitOption}
                className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-stone-800 transition disabled:opacity-40"
              >
                <span>Submit Technical Action</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                onClick={handleNextStep}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-indigo-700 transition"
              >
                <span>
                  {currentStepIndex < activeScenario.steps.length - 1 ? 'Next Diagnostic Step' : 'Complete Incident Triage'}
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};
