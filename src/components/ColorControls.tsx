'use client';

import { useLightingStore } from '@/hooks/useLightingStore';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { COLOR_PRESETS, hslToCSS } from '@/lib/colors';

export function ColorControls() {
  const {
    hue,
    saturation,
    brightness,
    colorMode,
    clockSource,
    setColor,
    setBrightness,
    setColorMode,
  } = useLightingStore();

  const isSpectrumAvailable = clockSource === 'audio';
  const isSpectrum = colorMode === 'spectrum' && isSpectrumAvailable;

  return (
    <div className="space-y-5">
      {/* Spectrum Mode Toggle (only when audio is active) */}
      {isSpectrumAvailable && (
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-stone-200">
              Spectrum Mode
            </label>
            <p className="text-xs text-stone-500">
              Color follows frequency bands
            </p>
          </div>
          <Switch
            checked={isSpectrum}
            onCheckedChange={(checked) =>
              setColorMode(checked ? 'spectrum' : 'manual')
            }
          />
        </div>
      )}

      {/* Hue */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-stone-400 uppercase tracking-wide">
          Hue
        </label>
        <div
          className="h-2 rounded-full"
          style={{
            background:
              'linear-gradient(to right, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))',
          }}
        />
        <Slider
          value={[hue]}
          min={0}
          max={360}
          step={1}
          onValueChange={([h]) => setColor({ h })}
          disabled={isSpectrum}
          className="mt-1"
        />
      </div>

      {/* Saturation */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-stone-400 uppercase tracking-wide">
          Saturation
        </label>
        <Slider
          value={[saturation]}
          min={0}
          max={100}
          step={1}
          onValueChange={([s]) => setColor({ s })}
          disabled={isSpectrum}
        />
      </div>

      {/* Brightness */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-stone-400 uppercase tracking-wide">
          Brightness — {brightness}%
        </label>
        <Slider
          value={[brightness]}
          min={0}
          max={100}
          step={1}
          onValueChange={([b]) => setBrightness(b)}
        />
      </div>

      {/* Presets */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-stone-400 uppercase tracking-wide">
          Presets
        </label>
        <div className="grid grid-cols-6 gap-2">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setColor({ h: preset.hsl.h, s: preset.hsl.s })}
              disabled={isSpectrum}
              className="aspect-square rounded-lg border border-stone-700 hover:border-stone-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors relative overflow-hidden group"
              style={{ backgroundColor: hslToCSS(preset.hsl) }}
              title={preset.name}
            >
              <span className="sr-only">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
