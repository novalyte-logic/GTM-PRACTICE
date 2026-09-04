'use client';

// Sound utility for Google TTS & Web Speech fallback for auditory learners

let globalAudioCtx: AudioContext | null = null;
let currentSourceNode: AudioBufferSourceNode | null = null;

function getAudioContext(): AudioContext {
  if (!globalAudioCtx || globalAudioCtx.state === 'closed') {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    globalAudioCtx = new AudioContextClass({ sampleRate: 24000 });
  }
  if (globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume();
  }
  return globalAudioCtx;
}

/**
 * Converts Base64 encoded 16-bit PCM (24kHz) to an AudioBuffer
 */
export function pcmBase64ToAudioBuffer(base64Data: string, sampleRate = 24000): AudioBuffer {
  const binaryString = window.atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // 16-bit PCM little endian
  const int16Array = new Int16Array(bytes.buffer);
  const float32Array = new Float32Array(int16Array.length);

  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / 32768.0;
  }

  const ctx = getAudioContext();
  const buffer = ctx.createBuffer(1, float32Array.length, sampleRate);
  buffer.copyToChannel(float32Array, 0);
  return buffer;
}

/**
 * Plays decoded AudioBuffer with playback rate support
 */
export function playAudioBuffer(
  buffer: AudioBuffer,
  playbackRate = 1.0,
  onEnded?: () => void
): { stop: () => void } {
  stopAllSpeech();

  const ctx = getAudioContext();
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = playbackRate;

  source.connect(ctx.destination);

  source.onended = () => {
    if (currentSourceNode === source) {
      currentSourceNode = null;
    }
    onEnded?.();
  };

  currentSourceNode = source;
  source.start(0);

  return {
    stop: () => {
      try {
        source.stop();
      } catch (e) {
        // already stopped
      }
      if (currentSourceNode === source) {
        currentSourceNode = null;
      }
    },
  };
}

/**
 * Stop any active TTS audio or Web Speech synthesis
 */
export function stopAllSpeech(): void {
  if (currentSourceNode) {
    try {
      currentSourceNode.stop();
    } catch (e) {
      // ignore
    }
    currentSourceNode = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Web Speech Fallback using Google US English Male or Natural Male voice
 */
export function speakWithWebSpeech(
  text: string,
  playbackRate = 1.0,
  onEnd?: () => void,
  onStart?: () => void
): { stop: () => void } {
  stopAllSpeech();

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onEnd?.();
    return { stop: () => {} };
  }

  const cleanText = text.replace(/[*#_`~>[\]]/g, '').replace(/\n+/g, ' ');
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = Math.max(0.7, Math.min(1.5, playbackRate));
  utterance.pitch = 0.95; // Slightly deeper, natural male resonance

  const setVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    // Prioritize high-quality natural male English voices
    const maleVoice = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Male') ||
          v.name.includes('David') ||
          v.name.includes('Guy') ||
          v.name.includes('Google US English') ||
          v.name.includes('Natural') ||
          v.name.includes('Daniel') ||
          v.name.includes('Alex'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (maleVoice) {
      utterance.voice = maleVoice;
    }
  };

  if (window.speechSynthesis.getVoices().length > 0) {
    setVoice();
  } else {
    window.speechSynthesis.onvoiceschanged = setVoice;
  }

  utterance.onstart = () => {
    onStart?.();
  };

  utterance.onend = () => {
    onEnd?.();
  };

  utterance.onerror = () => {
    onEnd?.();
  };

  window.speechSynthesis.speak(utterance);

  return {
    stop: () => {
      window.speechSynthesis.cancel();
      onEnd?.();
    },
  };
}
