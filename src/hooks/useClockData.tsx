'use client';

import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { AudioData, MidiClockData, MidiDevice } from '@/types';
import { useAudioAnalyzer } from '@/hooks/useAudioAnalyzer';
import { useLightingStore } from '@/hooks/useLightingStore';
import { useMidiClock } from '@/hooks/useMidiClock';

interface ClockDataContextValue {
  audioData: AudioData;
  audioError: string | null;
  isListening: boolean;
  midiClockData: MidiClockData;
  midiDevices: MidiDevice[];
  midiError: string | null;
  midiSupported: boolean;
  refreshMidiDevices: () => void;
}

const ClockDataContext = createContext<ClockDataContextValue | null>(null);

export function ClockDataProvider({ children }: { children: ReactNode }) {
  const {
    clockSource,
    midiDeviceId,
    audioSensitivity,
    audioSmoothing,
  } = useLightingStore();

  const { audioData, error: audioError, isListening } = useAudioAnalyzer({
    enabled: clockSource === 'audio',
    sensitivity: audioSensitivity,
    smoothing: audioSmoothing,
  });

  const {
    clockData: midiClockData,
    devices: midiDevices,
    error: midiError,
    isSupported: midiSupported,
    refreshDevices: refreshMidiDevices,
  } = useMidiClock({
    enabled: clockSource === 'midi',
    deviceId: midiDeviceId,
  });

  return (
    <ClockDataContext.Provider
      value={{
        audioData,
        audioError,
        isListening,
        midiClockData,
        midiDevices,
        midiError,
        midiSupported,
        refreshMidiDevices,
      }}
    >
      {children}
    </ClockDataContext.Provider>
  );
}

export function useClockData() {
  const context = useContext(ClockDataContext);
  if (!context) {
    throw new Error('useClockData must be used within a ClockDataProvider');
  }
  return context;
}
