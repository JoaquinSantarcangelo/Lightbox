import { useCallback, useEffect, useRef, useState } from 'react';
import type { AudioData } from '@/types';

interface UseAudioAnalyzerOptions {
  enabled: boolean;
  sensitivity: number;
  smoothing: number;
}

const DEFAULT_AUDIO_DATA: AudioData = {
  bass: 0,
  mid: 0,
  treble: 0,
  volume: 0,
  kick: false,
  bpm: 0,
  lastKickTime: 0,
};

// Beat detection constants
const HISTORY_SIZE = 43; // ~1 second at 60fps
const MIN_KICK_INTERVAL = 100; // ms (supports up to 600 BPM)
const BPM_HISTORY_SIZE = 8; // kicks to average for BPM

export function useAudioAnalyzer({
  enabled,
  sensitivity,
  smoothing,
}: UseAudioAnalyzerOptions) {
  const [audioData, setAudioData] = useState<AudioData>(DEFAULT_AUDIO_DATA);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number>(0);

  // Beat detection state
  const bassHistoryRef = useRef<number[]>([]);
  const lastKickTimeRef = useRef<number>(0);
  const kickTimesRef = useRef<number[]>([]);
  const bpmRef = useRef<number>(0);

  const cleanup = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current?.state !== 'closed') {
      audioContextRef.current?.close();
    }
    streamRef.current = null;
    audioContextRef.current = null;
    analyzerRef.current = null;
    bassHistoryRef.current = [];
    kickTimesRef.current = [];
    setIsListening(false);
  }, []);

  const startListening = useCallback(async () => {
    try {
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 512; // Higher resolution for better bass detection
      analyzer.smoothingTimeConstant = 0.3; // Less smoothing for faster response
      source.connect(analyzer);
      analyzerRef.current = analyzer;

      setIsListening(true);
    } catch (err) {
      const message =
        err instanceof Error && err.name === 'NotAllowedError'
          ? 'Microphone access denied'
          : 'Failed to access microphone';
      setError(message);
      setIsListening(false);
    }
  }, []);

  // Process audio data with beat detection
  useEffect(() => {
    if (!isListening || !analyzerRef.current) return;

    const analyzer = analyzerRef.current;
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const processAudio = () => {
      const now = performance.now();
      analyzer.getByteFrequencyData(dataArray);

      // Split into frequency bands (focus on low frequencies for kick)
      const bassEnd = Math.floor(bufferLength * 0.08); // Very low frequencies (kick)
      const subBassEnd = Math.floor(bufferLength * 0.04); // Sub bass
      const midEnd = Math.floor(bufferLength * 0.5);

      let bassSum = 0;
      let midSum = 0;
      let trebleSum = 0;

      for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i] / 255;
        if (i < bassEnd) bassSum += value;
        else if (i < midEnd) midSum += value;
        else trebleSum += value;
      }

      const sensitivityMultiplier = sensitivity / 50;
      const rawBass = (bassSum / bassEnd) * sensitivityMultiplier;
      const rawMid = (midSum / (midEnd - bassEnd)) * sensitivityMultiplier;
      const rawTreble = (trebleSum / (bufferLength - midEnd)) * sensitivityMultiplier;
      const rawVolume =
        (dataArray.reduce((a, b) => a + b, 0) / bufferLength / 255) * sensitivityMultiplier;

      // === KICK DETECTION ===
      // Use onset detection: compare current bass to recent average
      const bassHistory = bassHistoryRef.current;
      bassHistory.push(rawBass);
      if (bassHistory.length > HISTORY_SIZE) bassHistory.shift();

      let kick = false;
      if (bassHistory.length >= 5) {
        const average = bassHistory.reduce((a, b) => a + b, 0) / bassHistory.length;
        // Lower threshold for more sensitivity (1.2 base, sensitivity adds 0-0.5)
        const thresholdMultiplier = 1.2 + (sensitivity / 200);
        const threshold = Math.max(average * thresholdMultiplier, 0.05);

        const timeSinceLastKick = now - lastKickTimeRef.current;

        // Kick detected if: above threshold AND enough time passed
        // Removed minimum level requirement - threshold handles it
        if (rawBass > threshold && timeSinceLastKick > MIN_KICK_INTERVAL) {
          kick = true;
          lastKickTimeRef.current = now;

          // Update BPM estimation
          const kickTimes = kickTimesRef.current;
          kickTimes.push(now);
          if (kickTimes.length > BPM_HISTORY_SIZE) kickTimes.shift();

          if (kickTimes.length >= 2) {
            const intervals: number[] = [];
            for (let i = 1; i < kickTimes.length; i++) {
              const interval = kickTimes[i] - kickTimes[i - 1];
              // Filter out unrealistic intervals (50-200 BPM range)
              if (interval > 300 && interval < 1200) {
                intervals.push(interval);
              }
            }
            if (intervals.length >= 2) {
              const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
              bpmRef.current = Math.round(60000 / avgInterval);
            }
          }
        }
      }

      // Apply smoothing to frequency data (but not kick detection)
      const smoothFactor = smoothing / 100;

      setAudioData((prev) => ({
        bass: prev.bass * smoothFactor + rawBass * (1 - smoothFactor),
        mid: prev.mid * smoothFactor + rawMid * (1 - smoothFactor),
        treble: prev.treble * smoothFactor + rawTreble * (1 - smoothFactor),
        volume: prev.volume * smoothFactor + rawVolume * (1 - smoothFactor),
        kick,
        bpm: bpmRef.current,
        lastKickTime: kick ? now : lastKickTimeRef.current,
      }));

      frameRef.current = requestAnimationFrame(processAudio);
    };

    frameRef.current = requestAnimationFrame(processAudio);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isListening, sensitivity, smoothing]);

  // Start/stop based on enabled
  useEffect(() => {
    if (enabled && !isListening) {
      startListening();
    } else if (!enabled && isListening) {
      cleanup();
      setAudioData(DEFAULT_AUDIO_DATA);
    }

    return () => {
      if (!enabled) {
        cleanup();
      }
    };
  }, [enabled, isListening, startListening, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return { audioData, error, isListening };
}
