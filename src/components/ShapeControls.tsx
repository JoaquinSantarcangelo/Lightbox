'use client';

import { useLightingStore } from '@/hooks/useLightingStore';
import { Slider } from '@/components/ui/slider';
import type { ShapeId } from '@/types';
import { cn } from '@/lib/utils';

const SHAPES: { id: ShapeId; name: string; icon: string }[] = [
  { id: 'softbox', name: 'Softbox', icon: '⬜' },
  { id: 'ring', name: 'Ring', icon: '⭕' },
];

export function ShapeControls() {
  const {
    shape,
    ringSize,
    ringThickness,
    setShape,
    setRingSize,
    setRingThickness,
  } = useLightingStore();

  return (
    <div className="space-y-5">
      {/* Shape selector */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-stone-400 uppercase tracking-wide">
          Shape
        </label>
        <div className="grid grid-cols-2 gap-2">
          {SHAPES.map((s) => (
            <button
              key={s.id}
              onClick={() => setShape(s.id)}
              className={cn(
                'px-3 py-3 rounded-lg border text-sm font-medium transition-all flex flex-col items-center gap-1',
                shape === s.id
                  ? 'border-stone-500 bg-stone-800 text-stone-100'
                  : 'border-stone-700 bg-stone-900/50 text-stone-400 hover:border-stone-600'
              )}
            >
              <span className="text-xl">{s.icon}</span>
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Ring settings (only when ring is selected) */}
      {shape === 'ring' && (
        <>
          {/* Ring Size */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-stone-400 uppercase tracking-wide">
              Ring Size — {ringSize}%
            </label>
            <Slider
              value={[ringSize]}
              min={10}
              max={90}
              step={5}
              onValueChange={([s]) => setRingSize(s)}
            />
          </div>

          {/* Ring Thickness */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-stone-400 uppercase tracking-wide">
              Ring Thickness — {ringThickness}%
            </label>
            <Slider
              value={[ringThickness]}
              min={5}
              max={50}
              step={5}
              onValueChange={([t]) => setRingThickness(t)}
            />
          </div>
        </>
      )}
    </div>
  );
}
