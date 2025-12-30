import { useCallback, useEffect, useRef, useState } from 'react';
import type { AudioData, HSL, MidiClockData } from '@/types';
import { EFFECTS } from '@/lib/effects';
import { clamp } from '@/lib/colors';
import { useLightingStore } from './useLightingStore';

interface UseLightingEffectOptions {
  audioData?: AudioData;
  midiClockData?: MidiClockData;
}

export function useLightingEffect(options: UseLightingEffectOptions = {}) {
  const {
    hue,
    saturation,
    brightness,
    colorMode,
    effect,
    effectSpeed,
    effectIntensity,
    clockSource,
    manualBpm,
    tapTimes,
    audioMode,
  } = useLightingStore();

  const { audioData, midiClockData } = options;

  const [displayColor, setDisplayColor] = useState<HSL>({
    h: hue,
    s: saturation,
    l: 50,
  });

  const frameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const lastBeatTimeRef = useRef<number>(0);

  // Calculate effective BPM from any clock source
  const getEffectiveBpm = useCallback((): number => {
    if (clockSource === 'audio' && audioData?.bpm) {
      return audioData.bpm;
    }
    if (clockSource === 'midi' && midiClockData?.bpm) {
      return midiClockData.bpm;
    }
    if (clockSource === 'manual') {
      return manualBpm;
    }
    if (clockSource === 'tap' && tapTimes.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < tapTimes.length; i++) {
        intervals.push(tapTimes[i] - tapTimes[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      return Math.round(60000 / avgInterval);
    }
    return 0;
  }, [clockSource, audioData?.bpm, midiClockData?.bpm, manualBpm, tapTimes]);

  // Check if we're on a beat (for manual/tap clock sources)
  const isOnBeat = useCallback(
    (now: number, bpm: number): boolean => {
      if (bpm <= 0) return false;
      const beatInterval = 60000 / bpm;
      const timeSinceLastBeat = now - lastBeatTimeRef.current;
      if (timeSinceLastBeat >= beatInterval) {
        lastBeatTimeRef.current = now;
        return true;
      }
      return false;
    },
    []
  );

  const animate = useCallback(
    (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const now = performance.now();

      // For whites (saturation 0), use full lightness. For colors, use 50.
      const baseLightness = saturation < 10 ? 100 : 50;
      let computed: HSL = { h: hue, s: saturation, l: baseLightness };

      // Static effect - pure bright, no animation
      if (effect === 'static') {
        const finalL = (baseLightness * brightness) / 100;
        setDisplayColor({ h: hue, s: saturation, l: clamp(finalL, 0, 100) });
        frameRef.current = requestAnimationFrame(animate);
        return;
      }

      const isClockActive = clockSource !== 'off';
      const effectiveBpm = getEffectiveBpm();
      const beatInterval = effectiveBpm > 0 ? 60000 / effectiveBpm : 0;

      // Determine if we're on a beat
      let isKick = false;
      let timeSinceKick = 1000;

      if (clockSource === 'audio' && audioData) {
        isKick = audioData.kick;
        timeSinceKick = now - audioData.lastKickTime;
      } else if (clockSource === 'midi' && midiClockData && midiClockData.bpm > 0) {
        // MIDI clock provides beat timing from Traktor
        const midiTimeSinceBeat = now - midiClockData.lastBeatTime;
        // Only consider valid beat times (not initial 0)
        if (midiClockData.lastBeatTime > 0) {
          isKick = midiTimeSinceBeat < 30;
          timeSinceKick = midiTimeSinceBeat;
        } else {
          // No beats received yet, simulate from BPM
          isKick = isOnBeat(now, midiClockData.bpm);
          if (isKick) lastBeatTimeRef.current = now;
          timeSinceKick = now - lastBeatTimeRef.current;
        }
      } else if (isClockActive && effectiveBpm > 0) {
        // For manual/tap, simulate beat timing
        isKick = isOnBeat(now, effectiveBpm);
        if (isKick) {
          lastBeatTimeRef.current = now;
        }
        timeSinceKick = now - lastBeatTimeRef.current;
      }

      // === SPECTRUM MODE (audio only) ===
      if (
        clockSource === 'audio' &&
        colorMode === 'spectrum' &&
        audioData
      ) {
        const { bass, mid, treble } = audioData;
        const total = bass + mid + treble + 0.001;

        const bassNorm = bass / total;
        const midNorm = mid / total;
        const trebleNorm = treble / total;

        // Map frequencies to hues (Traktor-style)
        const blendHue =
          bassNorm * 15 + // Red/Orange
          midNorm * 90 + // Yellow/Green
          trebleNorm * 220; // Blue/Purple

        const energy = Math.pow(total / 3, 0.7);
        const spectrumL = 20 + energy * 80;

        computed = {
          h: blendHue % 360,
          s: 100,
          l: spectrumL,
        };
      }
      // === VOLUME MODE (audio only) ===
      else if (clockSource === 'audio' && audioMode === 'volume' && audioData) {
        const volumeBoost = Math.pow(audioData.volume, 0.6);
        const peakL = 15 + volumeBoost * 85;
        computed = { h: hue, s: saturation, l: peakL };
      }
      // === CLOCK-SYNCED EFFECTS ===
      else if (isClockActive && effectiveBpm > 0) {
        switch (effect) {
          case 'solid': {
            // Flash + decay on beat
            if (isKick || timeSinceKick < 20) {
              computed = { ...computed, l: 100 };
            } else {
              const decay = Math.exp(-timeSinceKick / 80);
              const baseL = baseLightness * 0.15;
              computed = { ...computed, l: baseL + decay * (100 - baseL) };
            }
            break;
          }

          case 'strobe': {
            // Strobe syncs to beat - flash on kick, off between
            if (isKick || timeSinceKick < 50) {
              computed = { ...computed, l: 100 };
            } else {
              computed = { ...computed, l: 0 };
            }
            break;
          }

          case 'pulse':
          case 'breathe': {
            // Pulse/breathe follows beat cycle
            const phase = (timeSinceKick / beatInterval) % 1;
            // Use sine wave for smooth oscillation
            const factor = 0.5 + 0.5 * Math.cos(phase * Math.PI * 2);
            const intensity = effectIntensity / 100;
            const adjustedL =
              baseLightness * (1 - intensity + intensity * factor);
            computed = { ...computed, l: clamp(adjustedL, 5, 100) };
            break;
          }

          default: {
            // Default beat behavior for any unhandled effect
            if (isKick || timeSinceKick < 20) {
              computed = { ...computed, l: 100 };
            } else {
              const decay = Math.exp(-timeSinceKick / 80);
              const baseL = baseLightness * 0.15;
              computed = { ...computed, l: baseL + decay * (100 - baseL) };
            }
          }
        }
      }
      // === NO CLOCK - NORMAL EFFECTS ===
      else {
        const effectFn = EFFECTS[effect];
        if (effectFn) {
          const baseColor: HSL = { h: hue, s: saturation, l: baseLightness };
          const settings = { speed: effectSpeed, intensity: effectIntensity };
          computed = effectFn.compute(baseColor, elapsed, settings);
        }
      }

      // Apply brightness
      const finalL = (computed.l * brightness) / 100;
      setDisplayColor({ ...computed, l: clamp(finalL, 0, 100) });

      frameRef.current = requestAnimationFrame(animate);
    },
    [
      hue,
      saturation,
      brightness,
      colorMode,
      effect,
      effectSpeed,
      effectIntensity,
      clockSource,
      audioMode,
      audioData,
      midiClockData,
      getEffectiveBpm,
      isOnBeat,
    ]
  );

  useEffect(() => {
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [animate]);

  return displayColor;
}
