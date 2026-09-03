'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  BookOpen, 
  Sparkles, 
  Copy, 
  Check, 
  DollarSign, 
  ShieldCheck, 
  Layers, 
  Zap, 
  Filter,
  Lightbulb,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { JARGON_DICTIONARY, JargonCategory, JargonTerm } from '@/lib/jargon-data';

export const JargonBuster: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<JargonCategory | 'All'>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories: (JargonCategory | 'All')[] = [
    'All',
    'Ingestion & Architecture',
    'Enrichment & Waterfall',
    'CRM & Data Hygiene',
    'Business & Pipeline',
    'AI & Modern Stack',
  ];

  const filteredTerms = useMemo(() => {
    return JARGON_DICTIONARY.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;

      const matchesQuery = 
        item.term.toLowerCase().includes(query) ||
        (item.acronym && item.acronym.toLowerCase().includes(query)) ||
        item.plainEnglish.toLowerCase().includes(query) ||
        item.whyCompaniesCare.toLowerCase().includes(query) ||
        item.jamilFounderHook.toLowerCase().includes(query) ||
        (item.relatedTools && item.relatedTools.some(t => t.toLowerCase().includes(query)));

      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Hero Banner */}
      <div className="rounded-3xl border border-stone-200 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 p-6 md:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3 py-1 text-xs font-bold text-indigo-200 border border-white/15">
            <BookOpen className="h-3.5 w-3.5 text-indigo-300" />
            <span>Corporate GTM Concept Translator</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            The GTM Jargon Buster
          </h1>
          <p className="text-sm md:text-base text-indigo-100/90 leading-relaxed">
            Corporate hiring leads and RevOps VPs use specialized industry jargon. 
            Here is every concept broken down in <strong className="text-white">plain English</strong>, 
            why companies care, and exactly how your <strong className="text-white">Novalyte AI &amp; Zendesk</strong> experience connects to it.
          </p>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Search & Category Filter Bar */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concepts (e.g. L2A, Waterfall, Idempotency)..."
              className="w-full rounded-xl border border-stone-200 bg-stone-50/70 pl-10 pr-4 py-2 text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          <div className="text-xs text-stone-500 font-medium">
            Showing <span className="font-bold text-stone-900">{filteredTerms.length}</span> of {JARGON_DICTIONARY.length} terms
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-stone-100">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Terms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredTerms.map((item) => {
          const isCopied = copiedId === item.id;

          return (
            <div
              key={item.id}
              className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header: Term, Category, Acronym */}
                <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-stone-900 text-base">{item.term}</h3>
                      {item.acronym && (
                        <span className="rounded-md bg-stone-100 px-2 py-0.5 font-mono text-[10px] font-bold text-stone-700 border border-stone-200">
                          {item.acronym}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-indigo-600">{item.category}</span>
                  </div>

                  {item.relatedTools && item.relatedTools.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-end max-w-[150px]">
                      {item.relatedTools.slice(0, 3).map((tool) => (
                        <span key={tool} className="rounded-md bg-stone-50 px-1.5 py-0.5 text-[10px] font-medium text-stone-600 border border-stone-200">
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 1. Plain English */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                    <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                    <span>In Plain English:</span>
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                    {item.plainEnglish}
                  </p>
                </div>

                {/* 2. Why Companies Care */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                    <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Why Hiring Managers Care:</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {item.whyCompaniesCare}
                  </p>
                </div>

                {/* 3. Jamil's Founder Hook */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Your Founder Hook (Novalyte / Zendesk):</span>
                  </div>
                  <p className="text-xs text-indigo-950 font-medium leading-relaxed bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-100">
                    {item.jamilFounderHook}
                  </p>
                </div>
              </div>

              {/* 4. Interview Soundbite (Bottom) */}
              <div className="pt-3 border-t border-stone-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-500">
                    🎙️ Say This in Your Interview:
                  </span>
                  <button
                    onClick={() => handleCopy(item.id, item.interviewSoundbite)}
                    className="inline-flex items-center gap-1 rounded-lg bg-stone-100 hover:bg-stone-200 px-2 py-1 text-[11px] font-bold text-stone-700 transition"
                    title="Copy interview quote"
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 text-stone-500" />
                        <span>Copy Soundbite</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="rounded-xl bg-stone-900 text-stone-100 p-3 text-xs italic leading-relaxed border border-stone-800">
                  {item.interviewSoundbite}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTerms.length === 0 && (
        <div className="rounded-2xl border border-dashed border-stone-300 p-12 text-center text-stone-500 space-y-2">
          <BookOpen className="h-8 w-8 mx-auto text-stone-400" />
          <div className="font-bold text-stone-800">No concepts found</div>
          <p className="text-xs text-stone-500">Try searching for &quot;waterfall&quot;, &quot;L2A&quot;, or clearing your filters.</p>
        </div>
      )}
    </div>
  );
};
