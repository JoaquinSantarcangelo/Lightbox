export type EffectId = 'static' | 'solid' | 'pulse' | 'breathe' | 'strobe';

export type ShapeId = 'softbox' | 'ring';

export type ClockSource = 'off' | 'audio' | 'manual' | 'tap' | 'midi';

export interface MidiDevice {
  id: string;
  name: string;
}

export interface MidiClockData {
  bpm: number;
  isPlaying: boolean;
  lastBeatTime: number;
}

export type AudioMode = 'beat' | 'volume';

export type ColorMode = 'manual' | 'spectrum';

export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

export interface EffectSettings {
  speed: number;     // 0.25-4
  intensity: number; // 0-100
}

export interface AudioSettings {
  enabled: boolean;
  mode: AudioMode;
  sensitivity: number; // 1-100
  smoothing: number;   // 0-100
}

export interface LightingEffect {
  id: EffectId;
  name: string;
  icon: string;
  compute: (
    baseColor: HSL,
    time: number,
    settings: EffectSettings
  ) => HSL;
}

export interface ColorPreset {
  id: string;
  name: string;
  hsl: HSL;
  temperature?: number; // Kelvin, for white presets
}

export interface AudioData {
  bass: number;      // 0-1
  mid: number;       // 0-1
  treble: number;    // 0-1
  volume: number;    // 0-1
  kick: boolean;     // true on kick hit (onset detected)
  bpm: number;       // estimated BPM from kick intervals
  lastKickTime: number; // timestamp of last kick for decay
}
