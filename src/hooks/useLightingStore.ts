import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AudioMode, ClockSource, ColorMode, EffectId, HSL, ShapeId } from '@/types';
import {
  DEFAULT_BRIGHTNESS,
  DEFAULT_COLOR,
  DEFAULT_TEMPERATURE,
} from '@/lib/colors';
import { DEFAULT_EFFECT_SETTINGS } from '@/lib/effects';

interface LightingState {
  // Color
  hue: number;
  saturation: number;
  brightness: number;
  temperature: number;
  colorMode: ColorMode;

  // Shape
  shape: ShapeId;
  ringSize: number; // 10-90 (percentage of screen)
  ringThickness: number; // 5-50 (percentage of ring size)

  // Effect
  effect: EffectId;
  effectSpeed: number;
  effectIntensity: number;

  // Clock
  clockSource: ClockSource;
  manualBpm: number;
  tapTimes: number[];
  midiDeviceId: string | null;

  // Audio (when clock source is 'audio')
  audioMode: AudioMode;
  audioSensitivity: number;
  audioSmoothing: number;

  // UI
  panelVisible: boolean;

  // Actions
  setColor: (hsl: Partial<HSL>) => void;
  setBrightness: (brightness: number) => void;
  setTemperature: (temperature: number) => void;
  setColorMode: (mode: ColorMode) => void;
  setShape: (shape: ShapeId) => void;
  setRingSize: (size: number) => void;
  setRingThickness: (thickness: number) => void;
  setEffect: (effect: EffectId) => void;
  setEffectSpeed: (speed: number) => void;
  setEffectIntensity: (intensity: number) => void;
  setClockSource: (source: ClockSource) => void;
  setManualBpm: (bpm: number) => void;
  addTapTime: () => void;
  clearTapTimes: () => void;
  setMidiDeviceId: (id: string | null) => void;
  setAudioMode: (mode: AudioMode) => void;
  setAudioSensitivity: (sensitivity: number) => void;
  setAudioSmoothing: (smoothing: number) => void;
  togglePanel: () => void;
  setPanel: (visible: boolean) => void;

  // Helpers
  getHSL: () => HSL;
  isClockActive: () => boolean;
  getEffectiveBpm: () => number;
}

// Tap tempo config
const TAP_HISTORY_SIZE = 8;
const TAP_TIMEOUT_MS = 2000;

export const useLightingStore = create<LightingState>()(
  persist(
    (set, get) => ({
      // Color defaults
      hue: DEFAULT_COLOR.h,
      saturation: DEFAULT_COLOR.s,
      brightness: DEFAULT_BRIGHTNESS,
      temperature: DEFAULT_TEMPERATURE,
      colorMode: 'manual',

      // Shape defaults
      shape: 'softbox',
      ringSize: 80,
      ringThickness: 15,

      // Effect defaults
      effect: 'solid',
      effectSpeed: DEFAULT_EFFECT_SETTINGS.speed,
      effectIntensity: DEFAULT_EFFECT_SETTINGS.intensity,

      // Clock defaults
      clockSource: 'off',
      manualBpm: 120,
      tapTimes: [],
      midiDeviceId: null,

      // Audio defaults
      audioMode: 'beat',
      audioSensitivity: 50,
      audioSmoothing: 30,

      // UI defaults
      panelVisible: true,

      // Actions
      setColor: (hsl) =>
        set((state) => ({
          hue: hsl.h ?? state.hue,
          saturation: hsl.s ?? state.saturation,
        })),

      setBrightness: (brightness) => set({ brightness }),
      setTemperature: (temperature) => set({ temperature }),
      setColorMode: (colorMode) => set({ colorMode }),
      setShape: (shape) => set({ shape }),
      setRingSize: (ringSize) => set({ ringSize: Math.max(10, Math.min(90, ringSize)) }),
      setRingThickness: (ringThickness) => set({ ringThickness: Math.max(5, Math.min(50, ringThickness)) }),
      setEffect: (effect) => set({ effect }),
      setEffectSpeed: (effectSpeed) => set({ effectSpeed }),
      setEffectIntensity: (effectIntensity) => set({ effectIntensity }),
      setClockSource: (clockSource) => set({ clockSource, tapTimes: [] }),
      setManualBpm: (manualBpm) => set({ manualBpm: Math.max(40, Math.min(300, manualBpm)) }),
      addTapTime: () =>
        set((state) => {
          const now = performance.now();
          const tapTimes = state.tapTimes.filter((t) => now - t < TAP_TIMEOUT_MS);
          tapTimes.push(now);
          if (tapTimes.length > TAP_HISTORY_SIZE) tapTimes.shift();
          return { tapTimes };
        }),
      clearTapTimes: () => set({ tapTimes: [] }),
      setMidiDeviceId: (midiDeviceId) => set({ midiDeviceId }),
      setAudioMode: (audioMode) => set({ audioMode }),
      setAudioSensitivity: (audioSensitivity) => set({ audioSensitivity }),
      setAudioSmoothing: (audioSmoothing) => set({ audioSmoothing }),
      togglePanel: () => set((state) => ({ panelVisible: !state.panelVisible })),
      setPanel: (panelVisible) => set({ panelVisible }),

      // Helpers
      getHSL: () => {
        const state = get();
        return {
          h: state.hue,
          s: state.saturation,
          l: 50,
        };
      },
      isClockActive: () => get().clockSource !== 'off',
      getEffectiveBpm: () => {
        const state = get();
        if (state.clockSource === 'manual') return state.manualBpm;
        if (state.clockSource === 'tap' && state.tapTimes.length >= 2) {
          const intervals: number[] = [];
          for (let i = 1; i < state.tapTimes.length; i++) {
            intervals.push(state.tapTimes[i] - state.tapTimes[i - 1]);
          }
          const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
          return Math.round(60000 / avgInterval);
        }
        return 0; // Audio mode returns 0, actual BPM comes from audio analyzer
      },
    }),
    {
      name: 'lightbox-settings',
      partialize: (state) => ({
        hue: state.hue,
        saturation: state.saturation,
        brightness: state.brightness,
        temperature: state.temperature,
        colorMode: state.colorMode,
        shape: state.shape,
        ringSize: state.ringSize,
        ringThickness: state.ringThickness,
        effect: state.effect,
        effectSpeed: state.effectSpeed,
        effectIntensity: state.effectIntensity,
        clockSource: state.clockSource,
        manualBpm: state.manualBpm,
        midiDeviceId: state.midiDeviceId,
        audioMode: state.audioMode,
        audioSensitivity: state.audioSensitivity,
        audioSmoothing: state.audioSmoothing,
      }),
    }
  )
);
