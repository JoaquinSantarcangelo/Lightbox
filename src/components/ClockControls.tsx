'use client';

import { useLightingStore } from '@/hooks/useLightingStore';
import { useClockData } from '@/hooks/useClockData';
import { Slider } from '@/components/ui/slider';
import type { AudioMode, ClockSource } from '@/types';
import { cn } from '@/lib/utils';
import { getEffectiveBpm } from '@/lib/clock';

const CLOCK_SOURCES: { id: ClockSource; name: string }[] = [
  { id: 'off', name: 'Off' },
  { id: 'audio', name: 'Audio' },
  { id: 'midi', name: 'MIDI' },
  { id: 'manual', name: 'Manual' },
  { id: 'tap', name: 'Tap' },
];

const AUDIO_MODES: { id: AudioMode; name: string; description: string }[] = [
  { id: 'beat', name: 'Beat', description: 'Flash on kick drums' },
  { id: 'volume', name: 'Volume', description: 'Brightness follows level' },
];

export function ClockControls() {
  const {
    clockSource,
    manualBpm,
    tapTimes,
    midiDeviceId,
    audioMode,
    audioSensitivity,
    audioSmoothing,
    setClockSource,
    setManualBpm,
    addTapTime,
    clearTapTimes,
    setMidiDeviceId,
    setAudioMode,
    setAudioSensitivity,
    setAudioSmoothing,
  } = useLightingStore();

  const {
    audioData,
    audioError,
    isListening,
    midiClockData,
    midiDevices,
    midiError,
    midiSupported,
    refreshMidiDevices,
  } = useClockData();

  const effectiveBpm = getEffectiveBpm({
    clockSource,
    manualBpm,
    tapTimes,
    audioBpm: audioData.bpm,
    midiBpm: midiClockData.bpm,
  });

  const tapCount = tapTimes.length;

  return (
    <div className="space-y-5">
      {/* Clock Source Selector */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-stone-400 uppercase tracking-wide">
          Clock Source
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {CLOCK_SOURCES.map((source) => (
            <button
              key={source.id}
              onClick={() => setClockSource(source.id)}
              className={cn(
                'px-2 py-2 rounded-lg border text-xs font-medium transition-all',
                clockSource === source.id
                  ? 'border-stone-500 bg-stone-800 text-stone-100'
                  : 'border-stone-700 bg-stone-900/50 text-stone-400 hover:border-stone-600'
              )}
            >
              {source.name}
            </button>
          ))}
        </div>
      </div>

      {/* BPM Display (when clock is active) */}
      {clockSource !== 'off' && (
        <div className="flex items-center justify-between bg-stone-900/50 rounded-lg px-4 py-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-3 h-3 rounded-full transition-all duration-75',
                clockSource === 'audio' && audioData.kick
                  ? 'bg-white scale-125 shadow-[0_0_12px_rgba(255,255,255,0.8)]'
                  : 'bg-stone-600 scale-100'
              )}
            />
            <span className="text-xs text-stone-400 uppercase tracking-wide">
              {clockSource === 'audio' ? 'Beat' : 'Clock'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-stone-100 tabular-nums">
              {effectiveBpm || '---'}
            </span>
            <span className="text-xs text-stone-500 ml-1">BPM</span>
          </div>
        </div>
      )}

      {/* Audio Mode (when audio source) */}
      {clockSource === 'audio' && (
        <>
          {audioError && (
            <p className="text-xs text-red-400 bg-red-950/30 px-3 py-2 rounded-lg">
              {audioError}
            </p>
          )}

          {/* Audio visualizer */}
          {isListening && (
            <div className="flex gap-1 h-8 items-end">
              <div
                className="flex-1 bg-stone-600 rounded-sm transition-all duration-75"
                style={{ height: `${Math.min(audioData.bass * 100, 100)}%` }}
                title="Bass"
              />
              <div
                className="flex-1 bg-stone-500 rounded-sm transition-all duration-75"
                style={{ height: `${Math.min(audioData.mid * 100, 100)}%` }}
                title="Mid"
              />
              <div
                className="flex-1 bg-stone-400 rounded-sm transition-all duration-75"
                style={{ height: `${Math.min(audioData.treble * 100, 100)}%` }}
                title="Treble"
              />
            </div>
          )}

          {/* Mode selector */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-stone-400 uppercase tracking-wide">
              Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              {AUDIO_MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setAudioMode(mode.id)}
                  className={cn(
                    'px-2 py-2 rounded-lg border text-xs font-medium transition-all',
                    audioMode === mode.id
                      ? 'border-stone-500 bg-stone-800 text-stone-100'
                      : 'border-stone-700 bg-stone-900/50 text-stone-400 hover:border-stone-600'
                  )}
                >
                  {mode.name}
                </button>
              ))}
            </div>
          </div>

          {/* Sensitivity */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-stone-400 uppercase tracking-wide">
              Sensitivity — {audioSensitivity}%
            </label>
            <Slider
              value={[audioSensitivity]}
              min={1}
              max={100}
              step={1}
              onValueChange={([s]) => setAudioSensitivity(s)}
            />
          </div>

          {/* Smoothing */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-stone-400 uppercase tracking-wide">
              Smoothing — {audioSmoothing}%
            </label>
            <Slider
              value={[audioSmoothing]}
              min={0}
              max={100}
              step={5}
              onValueChange={([s]) => setAudioSmoothing(s)}
            />
          </div>
        </>
      )}

      {/* Manual BPM Input */}
      {clockSource === 'manual' && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-stone-400 uppercase tracking-wide">
            BPM
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setManualBpm(manualBpm - 1)}
              className="w-10 h-10 rounded-lg border border-stone-700 bg-stone-900/50 text-stone-300 hover:border-stone-600 hover:bg-stone-800 transition-all text-lg font-medium"
            >
              −
            </button>
            <input
              type="number"
              value={manualBpm}
              onChange={(e) => setManualBpm(parseInt(e.target.value) || 120)}
              className="flex-1 h-10 px-3 rounded-lg border border-stone-700 bg-stone-900/50 text-center text-lg font-bold text-stone-100 tabular-nums focus:outline-none focus:border-stone-500"
              min={40}
              max={300}
            />
            <button
              onClick={() => setManualBpm(manualBpm + 1)}
              className="w-10 h-10 rounded-lg border border-stone-700 bg-stone-900/50 text-stone-300 hover:border-stone-600 hover:bg-stone-800 transition-all text-lg font-medium"
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Tap Tempo */}
      {clockSource === 'tap' && (
        <div className="space-y-3">
          <button
            onClick={addTapTime}
            className="w-full py-4 rounded-lg border-2 border-stone-600 bg-stone-900/50 text-stone-200 hover:border-stone-500 hover:bg-stone-800 active:bg-stone-700 transition-all text-lg font-semibold uppercase tracking-wide"
          >
            Tap
          </button>
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>{tapCount} tap{tapCount !== 1 ? 's' : ''}</span>
            {tapCount > 0 && (
              <button
                onClick={clearTapTimes}
                className="text-stone-400 hover:text-stone-300 underline"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}

      {/* MIDI Clock */}
      {clockSource === 'midi' && (
        <div className="space-y-3">
          {!midiSupported ? (
            <p className="text-xs text-amber-400 bg-amber-950/30 px-3 py-2 rounded-lg">
              Web MIDI not supported. Use Chrome on HTTPS.
            </p>
          ) : (
            <>
              {midiError && (
                <p className="text-xs text-red-400 bg-red-950/30 px-3 py-2 rounded-lg">
                  {midiError}
                </p>
              )}

              {/* Device selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-stone-400 uppercase tracking-wide">
                    MIDI Device
                  </label>
                  <button
                    onClick={refreshMidiDevices}
                    className="text-xs text-stone-400 hover:text-stone-300 underline"
                  >
                    Refresh
                  </button>
                </div>
                <select
                  value={midiDeviceId || ''}
                  onChange={(e) => setMidiDeviceId(e.target.value || null)}
                  className="w-full h-10 px-3 rounded-lg border border-stone-700 bg-stone-900/50 text-sm text-stone-200 focus:outline-none focus:border-stone-500"
                >
                  <option value="">Select device...</option>
                  {midiDevices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Connection status */}
              {midiDeviceId && (
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full',
                      midiClockData.bpm > 0 ? 'bg-green-500' : 'bg-stone-600'
                    )}
                  />
                  <span className="text-stone-400">
                    {midiClockData.bpm > 0
                      ? `Receiving clock @ ${midiClockData.bpm} BPM`
                      : 'Waiting for MIDI clock...'}
                  </span>
                </div>
              )}

              {/* Setup help */}
              {!midiDeviceId && midiDevices.length === 0 && (
                <p className="text-xs text-stone-500">
                  No MIDI devices found. Install loopMIDI and create a virtual port.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
