'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Headphones, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Waves, 
  Sliders, 
  ChevronDown, 
  Check, 
  Radio,
  Disc3
} from 'lucide-react';

export type SoundscapeType = 'brown-noise' | 'alpha-binaural' | 'zen-drone' | 'rain-texture';

interface SoundscapeOption {
  id: SoundscapeType;
  name: string;
  subtitle: string;
  description: string;
}

const SOUNDSCAPES: SoundscapeOption[] = [
  {
    id: 'brown-noise',
    name: 'Warm Brown Noise',
    subtitle: 'Deep Acoustic Masking',
    description: 'Rich low-frequency rumble that masks background speech and cognitive distraction.',
  },
  {
    id: 'alpha-binaural',
    name: 'Alpha Waves (10 Hz)',
    subtitle: 'Binaural Flow State',
    description: 'Stereo sine tones tuned to 128 Hz & 138 Hz to induce a 10 Hz alpha wave flow state.',
  },
  {
    id: 'zen-drone',
    name: 'Harmonic Zen Pad',
    subtitle: 'Ambient Sine Chord',
    description: 'Warm resonant fifths with a slow 15-second breathing filter oscillation.',
  },
  {
    id: 'rain-texture',
    name: 'Gentle Rain Texture',
    subtitle: 'Filtered Soft Static',
    description: 'Continuous soothing rainfall texture to settle technical nervousness.',
  },
];

// Audio buffer synthesis functions defined outside the React component
function createBrownNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const bufferSize = ctx.sampleRate * 5; // 5 second loop
  const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const channelData = buffer.getChannelData(channel);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      channelData[i] = lastOut * 3.5;
    }
  }
  return buffer;
}

function createRainTextureBuffer(ctx: AudioContext): AudioBuffer {
  const bufferSize = ctx.sampleRate * 4;
  const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.12;
      b6 = white * 0.115926;
    }
  }
  return buffer;
}

interface DeepWorkAudioProps {
  compact?: boolean;
}

export const DeepWorkAudio: React.FC<DeepWorkAudioProps> = ({ compact = false }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [soundscape, setSoundscape] = useState<SoundscapeType>('brown-noise');
  const [volume, setVolume] = useState<number>(30); // 0 to 100
  const [showMenu, setShowMenu] = useState<boolean>(false);

  // Web Audio Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const activeNodesRef = useRef<{
    sources: (AudioNode | AudioBufferSourceNode | OscillatorNode)[];
    intervals?: any[];
  }>({ sources: [] });

  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // Clean stop of all active audio nodes
  const stopAudioNodes = () => {
    try {
      if (masterGainRef.current && audioCtxRef.current) {
        const currentTime = audioCtxRef.current.currentTime;
        masterGainRef.current.gain.linearRampToValueAtTime(0.001, currentTime + 0.3);
      }

      setTimeout(() => {
        activeNodesRef.current.sources.forEach((node) => {
          try {
            if ('stop' in node && typeof (node as any).stop === 'function') {
              (node as any).stop();
            }
            node.disconnect();
          } catch {
            // ignore cleanup errors
          }
        });
        activeNodesRef.current.sources = [];
      }, 350);
    } catch (e) {
      console.error('Error stopping audio nodes', e);
    }
  };

  // Build audio graph for selected soundscape
  const startSoundscape = (type: SoundscapeType, targetVol: number) => {
    stopAudioNodes();

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) {
        alert('Web Audio API is not supported in this browser.');
        return;
      }

      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioCtxClass();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      const normalizedGain = Math.pow(targetVol / 100, 2) * 0.4;
      gain.gain.linearRampToValueAtTime(normalizedGain, ctx.currentTime + 0.5);
      gain.connect(ctx.destination);
      masterGainRef.current = gain;

      const sourcesToStore: AudioNode[] = [];

      if (type === 'brown-noise') {
        // Brown noise via filtered random buffer
        const buffer = createBrownNoiseBuffer(ctx);

        const noiseNode = ctx.createBufferSource();
        noiseNode.buffer = buffer;
        noiseNode.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(380, ctx.currentTime);
        filter.Q.setValueAtTime(0.7, ctx.currentTime);

        noiseNode.connect(filter);
        filter.connect(gain);
        noiseNode.start();
        sourcesToStore.push(noiseNode, filter);
      } else if (type === 'alpha-binaural') {
        // Binaural beat: 128Hz left, 138Hz right -> 10Hz Alpha beat
        const leftOsc = ctx.createOscillator();
        const rightOsc = ctx.createOscillator();
        leftOsc.type = 'sine';
        rightOsc.type = 'sine';
        leftOsc.frequency.setValueAtTime(128, ctx.currentTime);
        rightOsc.frequency.setValueAtTime(138, ctx.currentTime);

        const merger = ctx.createChannelMerger(2);
        leftOsc.connect(merger, 0, 0);
        rightOsc.connect(merger, 0, 1);

        merger.connect(gain);
        leftOsc.start();
        rightOsc.start();
        sourcesToStore.push(leftOsc, rightOsc, merger);
      } else if (type === 'zen-drone') {
        // Ambient warm sine pad chord (174Hz & 261Hz) with slow LFO
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(174, ctx.currentTime);
        osc2.frequency.setValueAtTime(261, ctx.currentTime);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, ctx.currentTime);

        // LFO for gentle breathing swell
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(0.06, ctx.currentTime); // ~16s cycle
        lfoGain.gain.setValueAtTime(80, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);

        osc1.start();
        osc2.start();
        lfo.start();
        sourcesToStore.push(osc1, osc2, filter, lfo, lfoGain);
      } else if (type === 'rain-texture') {
        // Soft rainfall texture: pink-ish noise with high frequency roll-off
        const buffer = createRainTextureBuffer(ctx);

        const rainNode = ctx.createBufferSource();
        rainNode.buffer = buffer;
        rainNode.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(820, ctx.currentTime);
        filter.Q.setValueAtTime(0.65, ctx.currentTime);

        rainNode.connect(filter);
        filter.connect(gain);
        rainNode.start();
        sourcesToStore.push(rainNode, filter);
      }

      activeNodesRef.current.sources = sourcesToStore;
      setIsPlaying(true);
    } catch (err) {
      console.error('Failed to start deep work audio', err);
      setIsPlaying(false);
    }
  };

  // Toggle audio on/off
  const toggleAudio = () => {
    if (isPlaying) {
      stopAudioNodes();
      setIsPlaying(false);
    } else {
      startSoundscape(soundscape, volume);
    }
  };

  // Change soundscape
  const handleSelectSoundscape = (type: SoundscapeType) => {
    setSoundscape(type);
    if (isPlaying) {
      startSoundscape(type, volume);
    }
  };

  // Change volume
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (masterGainRef.current && audioCtxRef.current) {
      const normalizedGain = Math.pow(newVol / 100, 2) * 0.4;
      masterGainRef.current.gain.linearRampToValueAtTime(
        normalizedGain,
        audioCtxRef.current.currentTime + 0.1
      );
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudioNodes();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        try {
          audioCtxRef.current.close();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const activeOption = SOUNDSCAPES.find((s) => s.id === soundscape) || SOUNDSCAPES[0];

  return (
    <div className="relative inline-flex items-center" ref={menuRef}>
      {/* Primary Toggle Button in Focus Mode Header */}
      <div className="flex items-center rounded-xl border border-stone-200 bg-white shadow-2xs overflow-hidden">
        <button
          onClick={toggleAudio}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition ${
            isPlaying
              ? 'bg-indigo-600 text-white'
              : 'bg-stone-50 text-stone-700 hover:bg-stone-100 hover:text-stone-900'
          }`}
          title={isPlaying ? 'Pause Deep Work Audio' : 'Play subtle Deep Work ambient focus soundscape'}
        >
          {isPlaying ? (
            <span className="flex items-center gap-1">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-200 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              <Waves className="h-3.5 w-3.5 animate-pulse" />
            </span>
          ) : (
            <Headphones className="h-3.5 w-3.5 text-indigo-600" />
          )}
          <span className="whitespace-nowrap">
            {isPlaying ? 'Deep Work Audio' : 'Deep Work Audio'}
          </span>
          {isPlaying && (
            <span className="hidden sm:inline-block text-[10px] opacity-80 font-normal">
              ({activeOption.name.split(' ')[0]})
            </span>
          )}
        </button>

        {/* Dropdown Options Trigger */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`px-1.5 py-1.5 border-l transition ${
            isPlaying
              ? 'border-indigo-500 bg-indigo-700 text-white hover:bg-indigo-800'
              : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
          }`}
          title="Change ambient soundscape or adjust volume"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Popover Settings Menu */}
      {showMenu && (
        <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl border border-stone-200 bg-white p-4 shadow-xl z-50 space-y-3.5 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
            <div className="flex items-center gap-1.5">
              <Headphones className="h-4 w-4 text-indigo-600" />
              <span className="text-xs font-bold text-stone-900">
                Deep Work Soundscapes
              </span>
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Web Audio Synthesized
            </span>
          </div>

          <p className="text-[11px] text-stone-500 leading-relaxed">
            Non-distracting ambient soundscapes generated in real-time to suppress distractions and sustain deep focus during system architecture drills.
          </p>

          {/* Soundscape presets */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Select Soundscape
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {SOUNDSCAPES.map((option) => {
                const isSelected = option.id === soundscape;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectSoundscape(option.id)}
                    className={`w-full text-left rounded-xl p-2.5 border transition ${
                      isSelected
                        ? 'border-indigo-400 bg-indigo-50/70 text-indigo-950 shadow-2xs'
                        : 'border-stone-100 bg-stone-50/50 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Radio className={`h-3.5 w-3.5 ${isSelected ? 'text-indigo-600' : 'text-stone-400'}`} />
                        <span className="text-xs font-bold text-stone-900">{option.name}</span>
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5 text-indigo-600" />}
                    </div>
                    <div className="text-[10px] text-stone-500 pl-5.5 mt-0.5">
                      {option.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Volume Control */}
          <div className="space-y-1.5 border-t border-stone-100 pt-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-stone-700">
                {volume === 0 ? (
                  <VolumeX className="h-3.5 w-3.5 text-stone-400" />
                ) : (
                  <Volume2 className="h-3.5 w-3.5 text-indigo-600" />
                )}
                <span>Volume</span>
              </div>
              <span className="font-mono text-[11px] text-stone-500">{volume}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* Quick Play/Pause & Close Action */}
          <div className="flex items-center justify-between pt-1 border-t border-stone-100">
            <button
              onClick={toggleAudio}
              className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition shadow-2xs ${
                isPlaying
                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isPlaying ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
              <span>{isPlaying ? 'Mute Audio' : 'Start Audio'}</span>
            </button>

            <button
              onClick={() => setShowMenu(false)}
              className="text-xs font-semibold text-stone-500 hover:text-stone-800"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
