'use client';

import { useLightingEffect } from '@/hooks/useLightingEffect';
import { useLightingStore } from '@/hooks/useLightingStore';
import { useClockData } from '@/hooks/useClockData';
import { hslToCSS } from '@/lib/colors';

export function LightingCanvas() {
  const {
    togglePanel,
    shape,
    ringSize,
    ringThickness,
  } = useLightingStore();

  const { audioData, midiClockData } = useClockData();

  const displayColor = useLightingEffect({ audioData, midiClockData });
  const color = hslToCSS(displayColor, 100);

  const handleInteraction = () => togglePanel();
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') togglePanel();
  };

  if (shape === 'ring') {
    // Ring dimensions as percentages
    const outerRadius = ringSize / 2;
    const innerRadius = outerRadius * (1 - ringThickness / 100);

    // Create radial gradient for ring effect
    const ringGradient = `radial-gradient(circle,
      transparent ${innerRadius}%,
      ${color} ${innerRadius}%,
      ${color} ${outerRadius}%,
      transparent ${outerRadius}%
    )`;

    return (
      <div
        className="fixed inset-0 w-screen h-screen bg-black cursor-pointer"
        style={{ background: `black ${ringGradient}` }}
        onClick={handleInteraction}
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label="Click to toggle control panel"
      />
    );
  }

  // Default softbox mode - full screen
  return (
    <div
      className="fixed inset-0 w-screen h-screen transition-colors duration-75 cursor-pointer"
      style={{ backgroundColor: color }}
      onClick={handleInteraction}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Click to toggle control panel"
    />
  );
}
