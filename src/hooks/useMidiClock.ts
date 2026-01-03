import { useCallback, useEffect, useRef, useState } from 'react';
import type { MidiClockData, MidiDevice } from '@/types';

// MIDI Clock messages
const MIDI_CLOCK = 0xf8; // Timing clock (24 per quarter note)
const MIDI_START = 0xfa; // Start
const MIDI_CONTINUE = 0xfb; // Continue
const MIDI_STOP = 0xfc; // Stop

// BPM calculation config
const PULSES_PER_BEAT = 24;
const PULSE_HISTORY_SIZE = 48; // 2 beats worth of pulses

interface UseMidiClockOptions {
  enabled: boolean;
  deviceId: string | null;
}

interface UseMidiClockReturn {
  clockData: MidiClockData;
  devices: MidiDevice[];
  error: string | null;
  isSupported: boolean;
  refreshDevices: () => void;
}

const DEFAULT_CLOCK_DATA: MidiClockData = {
  bpm: 0,
  isPlaying: false,
  lastBeatTime: 0,
};

export function useMidiClock({
  enabled,
  deviceId,
}: UseMidiClockOptions): UseMidiClockReturn {
  const [clockData, setClockData] = useState<MidiClockData>(DEFAULT_CLOCK_DATA);
  const [devices, setDevices] = useState<MidiDevice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [isReady, setIsReady] = useState(false);

  const midiAccessRef = useRef<MIDIAccess | null>(null);
  const pulseTimesRef = useRef<number[]>([]);
  const pulseCountRef = useRef<number>(0);
  const lastBeatTimeRef = useRef<number>(0);

  // Check Web MIDI support
  useEffect(() => {
    if (!navigator.requestMIDIAccess) {
      setIsSupported(false);
      setError('Web MIDI not supported in this browser');
    }
  }, []);

  // Refresh device list
  const refreshDevices = useCallback(async () => {
    if (!navigator.requestMIDIAccess) return;

    try {
      const access = await navigator.requestMIDIAccess();
      midiAccessRef.current = access;

      const inputDevices: MidiDevice[] = [];
      access.inputs.forEach((input) => {
        inputDevices.push({ id: input.id, name: input.name || 'Unknown Device' });
      });
      setDevices(inputDevices);
      setError(null);
      access.onstatechange = () => {
        const refreshed: MidiDevice[] = [];
        access.inputs.forEach((input) => {
          refreshed.push({ id: input.id, name: input.name || 'Unknown Device' });
        });
        setDevices(refreshed);
      };
      setIsReady(true);
    } catch (err) {
      setError('Failed to access MIDI devices');
      setIsReady(false);
    }
  }, []);

  // Initial device enumeration
  useEffect(() => {
    if (enabled && isSupported) {
      refreshDevices();
    }
  }, [enabled, isSupported, refreshDevices]);

  // Handle MIDI messages
  const handleMidiMessage = useCallback((event: MIDIMessageEvent) => {
    if (!event.data) return;
    const status = event.data[0];
    const now = performance.now();

    switch (status) {
      case MIDI_CLOCK: {
        // Add pulse time to history
        const pulseTimes = pulseTimesRef.current;
        pulseTimes.push(now);
        if (pulseTimes.length > PULSE_HISTORY_SIZE) {
          pulseTimes.shift();
        }

        // Calculate BPM from pulse intervals
        if (pulseTimes.length >= PULSES_PER_BEAT) {
          const intervals: number[] = [];
          for (let i = 1; i < pulseTimes.length; i++) {
            intervals.push(pulseTimes[i] - pulseTimes[i - 1]);
          }
          const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
          // BPM = 60000ms / (interval_per_pulse * 24 pulses_per_beat)
          const calculatedBpm = Math.round(60000 / (avgInterval * PULSES_PER_BEAT));

          // Track beats (every 24 pulses)
          pulseCountRef.current++;
          if (pulseCountRef.current >= PULSES_PER_BEAT) {
            pulseCountRef.current = 0;
            lastBeatTimeRef.current = now;
          }

          setClockData((prev) => ({
            ...prev,
            bpm: calculatedBpm,
            lastBeatTime: lastBeatTimeRef.current,
          }));
        }
        break;
      }

      case MIDI_START:
      case MIDI_CONTINUE: {
        pulseTimesRef.current = [];
        pulseCountRef.current = 0;
        setClockData((prev) => ({ ...prev, isPlaying: true }));
        break;
      }

      case MIDI_STOP: {
        setClockData((prev) => ({ ...prev, isPlaying: false }));
        break;
      }
    }
  }, []);

  // Connect to selected MIDI device
  useEffect(() => {
    if (!enabled || !deviceId || !isReady || !midiAccessRef.current) {
      return;
    }

    const access = midiAccessRef.current;
    const input = access.inputs.get(deviceId);

    if (!input) {
      setError(`MIDI device not found: ${deviceId}`);
      return;
    }

    // Reset state
    pulseTimesRef.current = [];
    pulseCountRef.current = 0;
    setClockData(DEFAULT_CLOCK_DATA);
    setError(null);

    // Attach listener
    input.onmidimessage = handleMidiMessage;

    return () => {
      input.onmidimessage = null;
    };
  }, [enabled, deviceId, isReady, handleMidiMessage]);

  // Cleanup on disable
  useEffect(() => {
    if (!enabled) {
      setClockData(DEFAULT_CLOCK_DATA);
      pulseTimesRef.current = [];
      pulseCountRef.current = 0;
      if (midiAccessRef.current) {
        midiAccessRef.current.onstatechange = null;
      }
      setIsReady(false);
    }
  }, [enabled]);

  return {
    clockData,
    devices,
    error,
    isSupported,
    refreshDevices,
  };
}
