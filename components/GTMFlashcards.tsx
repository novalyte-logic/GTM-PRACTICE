'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  RotateCw, 
  Shuffle, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Bookmark, 
  Layers, 
  Search, 
  Filter, 
  Check, 
  Copy, 
  BookOpen, 
  Lightbulb, 
  HelpCircle,
  Award,
  Grid,
  CreditCard
} from 'lucide-react';
import { GTM_FLASHCARDS } from '@/lib/flashcard-data';
import { GTMFlashcard, FlashcardCategory } from '@/lib/types';
import { useStorageItem } from '@/lib/useHydration';

const MASTERED_CARDS_STORAGE_KEY = 'gtm_mastered_flashcards_v1';

export const GTMFlashcards: React.FC = () => {
  const [cards, setCards] = useState<GTMFlashcard[]>(GTM_FLASHCARDS);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'deck' | 'grid'>('deck');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Mastered state stored in localStorage via safe external store
  const [masteredCardIds, setMasteredCardIds] = useStorageItem<string[]>(MASTERED_CARDS_STORAGE_KEY, []);

  // Filtered cards based on category and search
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const matchesCat = selectedCategory === 'all' || card.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCat;
      const matchesQuery = 
        card.term.toLowerCase().includes(query) ||
        card.definition.toLowerCase().includes(query) ||
        card.interviewTip.toLowerCase().includes(query) ||
        card.keyConcepts.some((k) => k.toLowerCase().includes(query));
      return matchesCat && matchesQuery;
    });
  }, [cards, selectedCategory, searchQuery]);

  const safeIndex = filteredCards.length === 0 ? 0 : Math.min(currentIndex, filteredCards.length - 1);
  const activeCard: GTMFlashcard | undefined = filteredCards[safeIndex];

  const handleNext = () => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const handleSelectCategory = (cat: FlashcardCategory | 'all') => {
    setSelectedCategory(cat);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // Keyboard navigation for power users
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (filteredCards.length > 0) {
          setIsFlipped(false);
          setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (filteredCards.length > 0) {
          setIsFlipped(false);
          setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredCards.length]);

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
  };

  const handleToggleMastered = (cardId: string) => {
    setMasteredCardIds((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
    );
  };

  const handleCopySnippet = (id: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const totalCardsCount = GTM_FLASHCARDS.length;
  const masteredCount = masteredCardIds.length;
  const masteryPercentage = Math.round((masteredCount / totalCardsCount) * 100);

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'All Domains' },
    { id: 'System Architecture & Queues', label: 'System Arch & Queues' },
    { id: 'CRM & Sync Hygiene', label: 'CRM & Sync Hygiene' },
    { id: 'Waterfall Enrichment', label: 'Waterfall Enrichment' },
    { id: 'Data Ops & SQL', label: 'Data Ops & SQL' },
    { id: 'AI-Native GTM & Orchestration', label: 'AI & Orchestration' },
  ];

  return (
    <div className="space-y-5">
      {/* Top Controls Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200">
            <CreditCard className="h-3.5 w-3.5 text-indigo-600" />
            Active Deck: {filteredCards.length} Cards
          </span>

          <div className="flex items-center gap-1.5 text-xs font-medium text-stone-600 bg-stone-100 rounded-full px-3 py-0.5 border border-stone-200">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Mastered: <strong className="text-stone-900">{masteredCount}</strong> / {totalCardsCount} ({masteryPercentage}%)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Shuffle Button */}
          <button
            onClick={handleShuffle}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition shadow-xs"
            title="Randomize card order"
          >
            <Shuffle className="h-3.5 w-3.5 text-indigo-600" />
            <span>Shuffle Random</span>
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl bg-stone-100 p-0.5 border border-stone-200">
            <button
              onClick={() => setViewMode('deck')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                viewMode === 'deck' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>Deck</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                viewMode === 'grid' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Grid className="h-3.5 w-3.5" />
              <span>Grid ({filteredCards.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleSelectCategory(cat.id as any)}
              className={`rounded-xl px-3 py-1 text-xs font-semibold transition ${
                selectedCategory === cat.id
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search concepts, terms..."
            className="w-full rounded-xl border border-stone-200 bg-white pl-9 pr-3 py-1 text-xs text-stone-900 placeholder:text-stone-400 focus:border-indigo-500 focus:outline-none shadow-xs"
          />
        </div>
      </div>

      {/* Mastery Progress Bar */}
      <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${masteryPercentage}%` }}
        />
      </div>

      {/* VIEW MODE: INTERACTIVE SINGLE FLASHCARD DECK */}
      {viewMode === 'deck' && (
        <div className="space-y-4">
          {filteredCards.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center space-y-2">
              <HelpCircle className="h-8 w-8 text-stone-300 mx-auto" />
              <div className="text-xs font-bold text-stone-800">No flashcards match your filter</div>
              <p className="text-[11px] text-stone-500">Try choosing a different domain category or clearing your search term.</p>
            </div>
          ) : activeCard && (
            <div className="space-y-4">
              {/* Card Outer Container with 3D Flip */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="relative min-h-[380px] w-full cursor-pointer rounded-2xl border border-stone-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:border-stone-300 flex flex-col justify-between p-6 sm:p-8"
              >
                {/* Top Card Badge Header */}
                <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700">
                      {activeCard.category}
                    </span>
                    <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-600 border border-stone-200">
                      {activeCard.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleMastered(activeCard.id);
                      }}
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold border transition ${
                        masteredCardIds.includes(activeCard.id)
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                          : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      <CheckCircle2 className={`h-3.5 w-3.5 ${masteredCardIds.includes(activeCard.id) ? 'text-emerald-600' : 'text-stone-400'}`} />
                      <span>{masteredCardIds.includes(activeCard.id) ? 'Mastered' : 'Mark Mastered'}</span>
                    </button>

                    <span className="text-xs font-mono font-bold text-stone-400">
                      {currentIndex + 1} / {filteredCards.length}
                    </span>
                  </div>
                </div>

                {/* Card Middle Content (Front vs Back) */}
                <div className="py-6 my-auto">
                  {!isFlipped ? (
                    /* FRONT OF CARD */
                    <div className="space-y-5 text-center sm:text-left animate-in fade-in">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-600">
                        <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                        GTM System Architecture Concept
                      </div>

                      <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
                        {activeCard.term}
                      </h3>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {activeCard.keyConcepts.map((kc, idx) => (
                          <span key={idx} className="rounded-md bg-stone-50 border border-stone-200 px-2 py-0.5 text-[11px] font-semibold text-stone-600">
                            #{kc}
                          </span>
                        ))}
                      </div>

                      <div className="pt-4 flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold text-indigo-600">
                        <RotateCw className="h-4 w-4 animate-spin-slow" />
                        <span>Click card or press Spacebar to flip for architecture breakdown & code</span>
                      </div>
                    </div>
                  ) : (
                    /* BACK OF CARD */
                    <div className="space-y-4 animate-in fade-in text-xs text-stone-800">
                      <div>
                        <div className="font-bold text-indigo-950 uppercase text-[10px] tracking-wider mb-1 flex items-center gap-1">
                          <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
                          Architectural Definition:
                        </div>
                        <p className="text-stone-700 leading-relaxed bg-stone-50 p-3.5 rounded-xl border border-stone-200 font-medium">
                          {activeCard.definition}
                        </p>
                      </div>

                      {/* Implementation Pattern Code */}
                      <div>
                        <div className="flex items-center justify-between font-bold text-stone-800 text-[10px] uppercase tracking-wider mb-1">
                          <span>Implementation Pattern / Logic:</span>
                          <button
                            onClick={(e) => handleCopySnippet(activeCard.id, activeCard.implementationPattern, e)}
                            className="inline-flex items-center gap-1 text-[10px] text-stone-500 hover:text-stone-900"
                          >
                            {copiedCodeId === activeCard.id ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                            <span>{copiedCodeId === activeCard.id ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <pre className="rounded-xl border border-stone-800 bg-stone-950 p-3 font-mono text-[11px] text-stone-300 overflow-x-auto whitespace-pre leading-relaxed">
                          {activeCard.implementationPattern}
                        </pre>
                      </div>

                      {/* Real World SaaS Example */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="rounded-xl bg-amber-50/70 p-3 border border-amber-200 space-y-1">
                          <div className="font-bold text-amber-900 uppercase text-[10px] tracking-wider flex items-center gap-1">
                            <Lightbulb className="h-3 w-3 text-amber-600" />
                            Production Context:
                          </div>
                          <p className="text-stone-700 text-[11px] leading-snug">
                            {activeCard.realWorldExample}
                          </p>
                        </div>

                        <div className="rounded-xl bg-indigo-50/70 p-3 border border-indigo-200 space-y-1">
                          <div className="font-bold text-indigo-900 uppercase text-[10px] tracking-wider flex items-center gap-1">
                            <Award className="h-3 w-3 text-indigo-600" />
                            Senior Interview Tip:
                          </div>
                          <p className="text-stone-700 text-[11px] leading-snug">
                            {activeCard.interviewTip}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer Navigation Controls */}
                <div className="flex items-center justify-between border-t border-stone-100 pt-3 text-xs">
                  <span className="text-stone-400 font-medium">
                    {isFlipped ? 'Click card to flip back to term' : 'Use ← / → arrow keys to navigate'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrev();
                      }}
                      className="p-1.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 shadow-2xs"
                      title="Previous Card (Left Arrow)"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFlipped(!isFlipped);
                      }}
                      className="rounded-xl bg-stone-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-stone-800 shadow-2xs"
                    >
                      {isFlipped ? 'Show Term' : 'Flip Card'}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNext();
                      }}
                      className="p-1.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 shadow-2xs"
                      title="Next Card (Right Arrow)"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE: GRID LIST VIEW OF ALL FLASHCARDS */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCards.map((card, idx) => {
            const isMastered = masteredCardIds.includes(card.id);
            return (
              <div
                key={card.id}
                className={`rounded-2xl border p-5 shadow-xs transition space-y-3 bg-white text-xs ${
                  isMastered ? 'border-emerald-300 ring-1 ring-emerald-400/20' : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-2.5">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="rounded-md bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                        {card.category}
                      </span>
                      <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-600">
                        {card.difficulty}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-stone-900 mt-1">
                      {card.term}
                    </h4>
                  </div>

                  <button
                    onClick={() => handleToggleMastered(card.id)}
                    className={`shrink-0 p-1.5 rounded-lg border transition ${
                      isMastered ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-stone-200 bg-stone-50 text-stone-400 hover:text-stone-700'
                    }`}
                    title={isMastered ? 'Mastered' : 'Mark as mastered'}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-stone-600 text-[11px] leading-relaxed">
                  {card.definition}
                </p>

                <div className="rounded-xl border border-stone-800 bg-stone-950 p-2.5 font-mono text-[10px] text-stone-300 overflow-x-auto whitespace-pre">
                  {card.implementationPattern.split('\n').slice(0, 4).join('\n')}
                  {card.implementationPattern.split('\n').length > 4 ? '\n...' : ''}
                </div>

                <div className="rounded-lg bg-indigo-50/70 p-2.5 border border-indigo-200 text-[11px] text-indigo-950">
                  <span className="font-bold text-indigo-900">Interview Tip: </span>
                  {card.interviewTip}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
