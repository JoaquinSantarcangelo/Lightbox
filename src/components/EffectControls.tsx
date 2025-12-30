'use client';

import { useLightingStore } from '@/hooks/useLightingStore';
import { Slider } from '@/components/ui/slider';
import { EFFECT_LIST } from '@/lib/effects';
import type { EffectId } from '@/types';
import { cn } from '@/lib/utils';

// Effects that sync to clock (speed slider disabled when clock active)
const CLOCK_SYNCED_EFFECTS: EffectId[] = ['solid', 'strobe', 'pulse', 'breathe'];

export function EffectControls() {
  const {
    effect,
    effectSpeed,
    effectIntensity,
    clockSource,
    setEffect,
    setEffectSpeed,
    setEffectIntensity,
  } = useLightingStore();

  const isClockActive = clockSource !== 'off';
  const isSpeedDisabled = isClockActive && CLOCK_SYNCED_EFFECTS.includes(effect);

  return (
    <div className="space-y-5">
      {/* Effect selector */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-stone-400 uppercase tracking-wide">
          Effect
        </label>
        <div className="grid grid-cols-3 gap-2">
          {EFFECT_LIST.map((fx) => (
            <button
              key={fx.id}
              onClick={() => setEffect(fx.id as EffectId)}
              className={cn(
                'px-3 py-2 rounded-lg border text-sm font-medium transition-all',
                effect === fx.id
                  ? 'border-stone-500 bg-stone-800 text-stone-100'
                  : 'border-stone-700 bg-stone-900/50 text-stone-400 hover:border-stone-600 hover:text-stone-300'
              )}
            >
              <span className="mr-1.5">{fx.icon}</span>
              {fx.name}
            </button>
          ))}
        </div>
      </div>

      {/* Speed */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-stone-400 uppercase tracking-wide">
            Speed — {effectSpeed.toFixed(1)}x
          </label>
          {isSpeedDisabled && (
            <span className="text-xs text-green-400">Synced to clock</span>
          )}
        </div>
        <Slider
          value={[effectSpeed]}
          min={0.25}
          max={4}
          step={0.25}
          onValueChange={([s]) => setEffectSpeed(s)}
          disabled={isSpeedDisabled}
        />
      </div>

      {/* Intensity */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-stone-400 uppercase tracking-wide">
          Intensity — {effectIntensity}%
        </label>
        <Slider
          value={[effectIntensity]}
          min={0}
          max={100}
          step={5}
          onValueChange={([i]) => setEffectIntensity(i)}
        />
      </div>
    </div>
  );
}
