'use client';

import { useLightingEffect } from '@/hooks/useLightingEffect';
import { useLightingStore } from '@/hooks/useLightingStore';
import { useAudioAnalyzer } from '@/hooks/useAudioAnalyzer';
import { useMidiClock } from '@/hooks/useMidiClock';
import { hslToCSS } from '@/lib/colors';

export function LightingCanvas() {
  const {
    togglePanel,
    clockSource,
    midiDeviceId,
    audioSensitivity,
    audioSmoothing,
  } = useLightingStore();

  const { audioData } = useAudioAnalyzer({
    enabled: clockSource === 'audio',
    sensitivity: audioSensitivity,
    smoothing: audioSmoothing,
  });

  const { clockData: midiClockData } = useMidiClock({
    enabled: clockSource === 'midi',
    deviceId: midiDeviceId,
  });

  const displayColor = useLightingEffect({ audioData, midiClockData });
  const backgroundColor = hslToCSS(displayColor, 100);

  return (
    <div
      className="fixed inset-0 w-screen h-screen transition-colors duration-75 cursor-pointer"
      style={{ backgroundColor }}
      onClick={togglePanel}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          togglePanel();
        }
      }}
      aria-label="Click to toggle control panel"
    />
  );
}
