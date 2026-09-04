'use client';

import React, { useState, useEffect, useRef, useId } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Loader2, 
  Headphones, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Radio,
  FileText
} from 'lucide-react';
import { 
  pcmBase64ToAudioBuffer, 
  playAudioBuffer, 
  speakWithWebSpeech, 
  stopAllSpeech 
} from '@/lib/audio-tts';

export interface AudioCoachPlayerProps {
  /** The text or prompt to explain aloud */
  topicOrText: string;
  /** Optional richer context or question description */
  context?: string;
  /** Type of audio explanation */
  type?: 'question-explainer' | 'target-strategy' | 'architecture-concept' | 'flashcard-analogy' | 'direct-tts';
  /** Target company name if applicable */
  targetCompany?: string;
  /** Target role profile */
  roleProfile?: string;
  /** Button title / label */
  buttonLabel?: string;
  /** Compact or full player mode */
  variant?: 'compact-pill' | 'inline-button' | 'card-banner' | 'floating-bar';
  /** Auto-start audio immediately */
  autoPlay?: boolean;
  /** Custom CSS classes */
  className?: string;
}

export const AudioCoachPlayer: React.FC<AudioCoachPlayerProps> = ({
  topicOrText,
  context = '',
  type = 'question-explainer',
  targetCompany = '',
  roleProfile = 'GTM Systems Engineer',
  buttonLabel = 'Explain in Audio',
  variant = 'inline-button',
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [selectedVoice, setSelectedVoice] = useState<string>('Fenrir'); // Google TTS Male Voice
  const [spokenTranscript, setSpokenTranscript] = useState<string>('');
  const [showTranscript, setShowTranscript] = useState<boolean>(false);
  const [cachedBuffer, setCachedBuffer] = useState<AudioBuffer | null>(null);
  const [audioProgress, setAudioProgress] = useState<number>(0);

  const stopHandleRef = useRef<{ stop: () => void } | null>(null);
  const progressIntervalRef = useRef<any>(null);
  const uniqueId = useId();

  const prevKeyRef = useRef(`${topicOrText}-${context}-${type}-${targetCompany}`);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopHandleRef.current?.stop();
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // When input text changes, stop any running playback
  useEffect(() => {
    const currentKey = `${topicOrText}-${context}-${type}-${targetCompany}`;
    if (prevKeyRef.current !== currentKey) {
      prevKeyRef.current = currentKey;
      stopHandleRef.current?.stop();
    }
  }, [topicOrText, context, type, targetCompany]);

  const handleTogglePlay = async () => {
    if (isPlaying) {
      stopHandleRef.current?.stop();
      setIsPlaying(false);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    // If we already have the cached audio buffer, play immediately
    if (cachedBuffer) {
      playBufferDirect(cachedBuffer);
      return;
    }

    setIsLoading(true);

    try {
      if (type === 'direct-tts') {
        // Direct text-to-speech without LLM expansion
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: topicOrText,
            voice: selectedVoice,
          }),
        });

        const data = await res.json();
        setSpokenTranscript(data.transcript || topicOrText);

        if (data.audioData) {
          const buffer = pcmBase64ToAudioBuffer(data.audioData, data.sampleRate || 24000);
          setCachedBuffer(buffer);
          setIsLoading(false);
          playBufferDirect(buffer);
        } else {
          // Fallback to Web Speech Synthesis
          setIsLoading(false);
          playWithWebSpeechDirect(data.transcript || topicOrText);
        }
      } else {
        // Generate conversational spoken explanation + Google TTS
        const res = await fetch('/api/explain-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: topicOrText,
            context,
            type,
            targetCompany,
            roleProfile,
            voice: selectedVoice,
          }),
        });

        const data = await res.json();
        const script = data.spokenScript || data.title || topicOrText;
        setSpokenTranscript(script);

        if (data.audioData) {
          const buffer = pcmBase64ToAudioBuffer(data.audioData, data.sampleRate || 24000);
          setCachedBuffer(buffer);
          setIsLoading(false);
          playBufferDirect(buffer);
        } else {
          // Fallback to Web Speech Synthesis with Google male voice
          setIsLoading(false);
          playWithWebSpeechDirect(script);
        }
      }
    } catch (err) {
      console.warn('Google TTS service fallback to Web Speech:', err);
      setIsLoading(false);
      const fallbackText = spokenTranscript || topicOrText;
      playWithWebSpeechDirect(fallbackText);
    }
  };

  const playBufferDirect = (buffer: AudioBuffer) => {
    setIsPlaying(true);
    setAudioProgress(0);

    const startTime = Date.now();
    const durationMs = (buffer.duration / playbackSpeed) * 1000;

    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / durationMs) * 100);
      setAudioProgress(progress);
      if (progress >= 100) {
        clearInterval(progressIntervalRef.current);
      }
    }, 100);

    const handle = playAudioBuffer(buffer, playbackSpeed, () => {
      setIsPlaying(false);
      setAudioProgress(100);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    });

    stopHandleRef.current = handle;
  };

  const playWithWebSpeechDirect = (text: string) => {
    setIsPlaying(true);
    setAudioProgress(0);

    const handle = speakWithWebSpeech(
      text,
      playbackSpeed,
      () => {
        setIsPlaying(false);
        setAudioProgress(100);
      },
      () => {
        setIsPlaying(true);
      }
    );

    stopHandleRef.current = handle;
  };

  const handleSpeedChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    const speeds = [1.0, 1.25, 1.5];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackSpeed(nextSpeed);

    // If currently playing, restart with new speed
    if (isPlaying && cachedBuffer) {
      stopHandleRef.current?.stop();
      playBufferDirect(cachedBuffer);
    }
  };

  const handleRestart = (e: React.MouseEvent) => {
    e.stopPropagation();
    stopHandleRef.current?.stop();
    if (cachedBuffer) {
      playBufferDirect(cachedBuffer);
    } else {
      handleTogglePlay();
    }
  };

  // 1. Compact Pill Variant (fits smoothly in badges, cards, flashcards)
  if (variant === 'compact-pill') {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <button
          id={`audio-pill-${uniqueId}`}
          onClick={handleTogglePlay}
          disabled={isLoading}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition shadow-2xs cursor-pointer ${
            isPlaying
              ? 'bg-amber-600 text-white animate-pulse'
              : 'bg-stone-900 text-white hover:bg-stone-800'
          }`}
          title="Listen to Google TTS Male Voice Audio Explanation"
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-3.5 w-3.5 fill-current" />
          ) : (
            <Volume2 className="h-3.5 w-3.5 text-amber-300" />
          )}
          <span>{isPlaying ? 'Pause' : buttonLabel}</span>
        </button>

        {isPlaying && (
          <button
            onClick={handleSpeedChange}
            className="rounded-full bg-stone-100 border border-stone-200 px-1.5 py-0.5 text-[10px] font-bold text-stone-700 hover:bg-stone-200"
            title="Adjust Audio Speed"
          >
            {playbackSpeed}x
          </button>
        )}
      </div>
    );
  }

  // 2. Card Banner / Full Explainer Card Variant
  if (variant === 'card-banner') {
    return (
      <div className={`rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50/70 via-orange-50/40 to-stone-50 p-4 shadow-xs space-y-3 ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
              isPlaying ? 'bg-amber-500 text-white shadow-xs' : 'bg-amber-100 text-amber-800'
            }`}>
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isPlaying ? (
                <Volume2 className="h-5 w-5 animate-pulse" />
              ) : (
                <Headphones className="h-5 w-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-amber-950 uppercase tracking-wider">
                  Auditory Learner Voice Coach
                </span>
                <span className="rounded-full bg-amber-200/80 px-2 py-0.2 text-[10px] font-bold text-amber-900">
                  Google TTS Male (Fenrir)
                </span>
              </div>
              <p className="text-xs font-semibold text-stone-700">
                {isPlaying ? 'Speaking out loud...' : 'Hear this explained verbally instead of reading'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id={`audio-banner-play-${uniqueId}`}
              onClick={handleTogglePlay}
              disabled={isLoading}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition shadow-xs cursor-pointer ${
                isPlaying 
                  ? 'bg-amber-600 text-white hover:bg-amber-700' 
                  : 'bg-stone-900 text-white hover:bg-stone-800'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Synthesizing Audio...</span>
                </>
              ) : isPlaying ? (
                <>
                  <Pause className="h-4 w-4 fill-current" />
                  <span>Pause Audio</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current text-amber-400" />
                  <span>{buttonLabel}</span>
                </>
              )}
            </button>

            {isPlaying && (
              <>
                <button
                  onClick={handleRestart}
                  className="rounded-xl border border-stone-200 bg-white p-2 text-stone-700 hover:bg-stone-100 shadow-2xs"
                  title="Restart from beginning"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  onClick={handleSpeedChange}
                  className="rounded-xl border border-stone-200 bg-white px-2.5 py-2 text-xs font-bold text-stone-700 hover:bg-stone-100 shadow-2xs"
                  title="Playback Speed"
                >
                  {playbackSpeed}x
                </button>
              </>
            )}

            {spokenTranscript && (
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className={`rounded-xl border p-2 text-xs font-bold transition shadow-2xs ${
                  showTranscript 
                    ? 'border-amber-400 bg-amber-100 text-amber-900' 
                    : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-100'
                }`}
                title="View spoken transcript"
              >
                <FileText className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Audio Progress Bar when Playing */}
        {isPlaying && (
          <div className="space-y-1">
            <div className="h-1.5 w-full bg-amber-200/60 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-600 rounded-full transition-all duration-100"
                style={{ width: `${audioProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-amber-900/80 font-medium">
              <span className="flex items-center gap-1">
                <Radio className="h-3 w-3 animate-ping text-amber-600" /> Audio streaming via Google TTS
              </span>
              <span>Speed: {playbackSpeed}x</span>
            </div>
          </div>
        )}

        {/* Expandable Synchronized Transcript */}
        {showTranscript && spokenTranscript && (
          <div className="rounded-xl border border-amber-200/80 bg-white p-3.5 text-xs text-stone-800 space-y-1.5 shadow-inner animate-in fade-in duration-200">
            <div className="font-bold text-amber-950 flex items-center justify-between">
              <span>Spoken Audio Script:</span>
              <span className="text-[10px] text-stone-400 font-normal">Follow along with audio</span>
            </div>
            <p className="text-stone-700 leading-relaxed italic">
              &quot;{spokenTranscript}&quot;
            </p>
          </div>
        )}
      </div>
    );
  }

  // 3. Standard Inline Button Variant (Default)
  return (
    <div className={`inline-flex flex-col gap-1.5 ${className}`}>
      <div className="inline-flex items-center gap-2">
        <button
          id={`audio-btn-${uniqueId}`}
          onClick={handleTogglePlay}
          disabled={isLoading}
          className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition shadow-xs cursor-pointer ${
            isPlaying
              ? 'bg-amber-600 text-white hover:bg-amber-700 ring-2 ring-amber-400/50'
              : 'bg-stone-900 text-white hover:bg-stone-800'
          }`}
          title="Listen to Google TTS Male Voice Audio Explanation"
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-3.5 w-3.5 fill-current" />
          ) : (
            <Headphones className="h-3.5 w-3.5 text-amber-400" />
          )}
          <span>{isLoading ? 'Synthesizing...' : isPlaying ? 'Pause Audio' : buttonLabel}</span>
        </button>

        {isPlaying && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleRestart}
              className="rounded-lg border border-stone-200 bg-white p-1 text-stone-600 hover:bg-stone-100"
              title="Restart"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
            <button
              onClick={handleSpeedChange}
              className="rounded-lg border border-stone-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-stone-700 hover:bg-stone-100"
              title="Change Speed"
            >
              {playbackSpeed}x
            </button>
            {spokenTranscript && (
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className={`rounded-lg border px-1.5 py-0.5 text-[10px] font-bold ${
                  showTranscript ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-white text-stone-600 border-stone-200'
                }`}
                title="Toggle transcript"
              >
                Script
              </button>
            )}
          </div>
        )}
      </div>

      {/* Transcript dropdown if enabled */}
      {showTranscript && spokenTranscript && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-2.5 text-xs text-stone-700 leading-relaxed shadow-xs max-w-lg">
          <span className="font-bold text-amber-950 block text-[10px] uppercase mb-1">Spoken Explanation:</span>
          {spokenTranscript}
        </div>
      )}
    </div>
  );
};
