import type { ColorPreset, HSL } from '@/types';

// Temperature to HSL conversion (approximate)
// Maps Kelvin (2700-6500) to warm orange-white-blue tones
export function temperatureToHSL(kelvin: number): HSL {
  const normalized = (kelvin - 2700) / (6500 - 2700); // 0-1

  if (normalized < 0.5) {
    // Warm (2700K-4600K): orange-yellow tint
    return {
      h: 30 + normalized * 20, // 30-40
      s: 100 - normalized * 80, // 100-60
      l: 50,
    };
  }
  // Cool (4600K-6500K): neutral to slight blue
  return {
    h: 40 + (normalized - 0.5) * 180, // 40-130
    s: 60 - (normalized - 0.5) * 50, // 60-35
    l: 50,
  };
}

export function hslToCSS(hsl: HSL, brightness: number = 100): string {
  const adjustedL = (hsl.l * brightness) / 100;
  return `hsl(${hsl.h}, ${hsl.s}%, ${adjustedL}%)`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// DJ Color presets (vibrant, high saturation)
export const COLOR_PRESETS: ColorPreset[] = [
  // Whites
  { id: 'white', name: 'White', hsl: { h: 0, s: 0, l: 100 } },
  { id: 'warmWhite', name: 'Warm', hsl: { h: 40, s: 30, l: 90 } },

  // DJ Colors
  { id: 'hotPink', name: 'Hot Pink', hsl: { h: 330, s: 100, l: 50 } },
  { id: 'electricBlue', name: 'Electric', hsl: { h: 220, s: 100, l: 55 } },
  { id: 'deepPurple', name: 'Purple', hsl: { h: 270, s: 100, l: 45 } },
  { id: 'neonGreen', name: 'Neon', hsl: { h: 120, s: 100, l: 50 } },
  { id: 'cyan', name: 'Cyan', hsl: { h: 180, s: 100, l: 50 } },
  { id: 'amber', name: 'Amber', hsl: { h: 35, s: 100, l: 50 } },
  { id: 'red', name: 'Red', hsl: { h: 0, s: 100, l: 50 } },
  { id: 'magenta', name: 'Magenta', hsl: { h: 300, s: 100, l: 50 } },
  { id: 'uv', name: 'UV', hsl: { h: 260, s: 100, l: 35 } },

  // Special
  { id: 'black', name: 'Off', hsl: { h: 0, s: 0, l: 0 } },
];

// Default color
export const DEFAULT_COLOR: HSL = { h: 40, s: 30, l: 50 }; // Daylight
export const DEFAULT_BRIGHTNESS = 100;
export const DEFAULT_TEMPERATURE = 5600;
