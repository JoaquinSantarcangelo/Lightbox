import type { EffectSettings, HSL, LightingEffect } from '@/types';
import { clamp } from './colors';

// Static - constant color, ignores clock sync
const staticEffect: LightingEffect = {
  id: 'static',
  name: 'Static',
  icon: '■',
  compute: (baseColor) => baseColor,
};

// Solid - no animation, syncs to clock for beat flash
const solid: LightingEffect = {
  id: 'solid',
  name: 'Solid',
  icon: '●',
  compute: (baseColor) => baseColor,
};

// Pulse - smooth brightness oscillation
const pulse: LightingEffect = {
  id: 'pulse',
  name: 'Pulse',
  icon: '◐',
  compute: (baseColor, time, settings) => {
    const frequency = settings.speed * 2;
    const amplitude = settings.intensity / 100;
    const factor = 0.5 + 0.5 * Math.sin((time / 1000) * frequency * Math.PI);
    const adjustedL = baseColor.l * (1 - amplitude + amplitude * factor);

    return { ...baseColor, l: clamp(adjustedL, 0, 100) };
  },
};

// Breathe - slower, smoother fade
const breathe: LightingEffect = {
  id: 'breathe',
  name: 'Breathe',
  icon: '◯',
  compute: (baseColor, time, settings) => {
    const frequency = settings.speed * 0.5;
    const amplitude = settings.intensity / 100;
    // Ease in-out curve
    const t = (Math.sin((time / 1000) * frequency * Math.PI - Math.PI / 2) + 1) / 2;
    const eased = t * t * (3 - 2 * t); // smoothstep
    const adjustedL = baseColor.l * (1 - amplitude + amplitude * eased);

    return { ...baseColor, l: clamp(adjustedL, 5, 100) };
  },
};

// Strobe - on/off flash
const strobe: LightingEffect = {
  id: 'strobe',
  name: 'Strobe',
  icon: '⚡',
  compute: (baseColor, time, settings) => {
    const frequency = settings.speed * 5;
    const dutyCycle = settings.intensity / 100;
    const phase = ((time / 1000) * frequency) % 1;
    const isOn = phase < dutyCycle;

    return isOn ? baseColor : { ...baseColor, l: 0 };
  },
};

// Export all effects
export const EFFECTS: Record<string, LightingEffect> = {
  static: staticEffect,
  solid,
  pulse,
  breathe,
  strobe,
};

export const EFFECT_LIST = Object.values(EFFECTS);

export const DEFAULT_EFFECT_SETTINGS: EffectSettings = {
  speed: 1,
  intensity: 50,
};
