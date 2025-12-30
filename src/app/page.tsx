'use client';

import { useEffect } from 'react';
import { LightingCanvas } from '@/components/LightingCanvas';
import { ControlPanel } from '@/components/ControlPanel';
import { useLightingStore } from '@/hooks/useLightingStore';
import { COLOR_PRESETS } from '@/lib/colors';

export default function Home() {
  const { togglePanel, setPanel, setColor } = useLightingStore();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key) {
        case 'Escape':
          setPanel(false);
          break;
        case 'f':
        case 'F':
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
          } else {
            document.exitFullscreen();
          }
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          {
            const index = parseInt(e.key) - 1;
            const preset = COLOR_PRESETS[index];
            if (preset) {
              setColor({ h: preset.hsl.h, s: preset.hsl.s });
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePanel, setPanel, setColor]);

  return (
    <>
      <LightingCanvas />
      <ControlPanel />
    </>
  );
}
