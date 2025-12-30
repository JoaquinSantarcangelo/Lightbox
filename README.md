# Lightbox

Transform your TV into a professional softbox/lighting tool. Optimized for DJ set recordings with unified clock/BPM control.

## Features

- **DJ Color Palette**: Hot Pink, Electric Blue, Deep Purple, Neon Green, UV, Amber, Cyan, and more
- **Unified Clock System**: Control effects via MIDI Clock, Audio detection, Manual BPM, or Tap Tempo
- **Traktor Integration**: Direct MIDI Clock sync via Web MIDI API
- **Beat Detection**: Onset detection algorithm synced to kick drums with BPM display
- **Flash + Decay**: Full brightness on kick, exponential decay between beats
- **Lighting Effects**: Solid, Pulse, Breathe, Strobe (all sync to clock when active)
- **Spectrum Mode**: Color follows frequency bands (Traktor-style)
- **Persistence**: Settings saved to localStorage automatically

## Tech Stack

- Next.js 16 (App Router)
- shadcn/ui components
- Tailwind CSS
- Zustand (state management)
- motion/react (animations)
- Web Audio API (beat detection + frequency analysis)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `F` | Toggle fullscreen |
| `Escape` | Hide control panel |
| `1-9` | Quick color presets |
| Click canvas | Toggle control panel |

## Clock System

The Clock tab provides unified tempo control for all rhythm-based effects.

### Clock Sources

| Source | Description |
|--------|-------------|
| **Off** | Effects run at their own speed (controlled by Speed slider) |
| **Audio** | Auto-detect BPM from microphone input |
| **MIDI** | Receive MIDI Clock from Traktor/DAW (requires loopMIDI) |
| **Manual** | Set BPM manually (40-300 range) |
| **Tap** | Tap to set tempo (4-8 taps averaged) |

### MIDI Clock Setup (Traktor Pro 4)

For precise sync with Traktor, use MIDI Clock:

#### 1. Install loopMIDI (Windows)
Download from [tobias-erichsen.de](https://www.tobias-erichsen.de/software/loopmidi.html), create a virtual port named "Lightbox"

#### 2. Configure Traktor Pro 4

**Add Generic MIDI Device:**
- Go to **Preferences → Controller Manager**
- Click **Add...** below Device field → Select **Generic MIDI**
- Set **Out-Port** to your loopMIDI port ("Lightbox")
- Set **In-Port** to **None** (prevents MIDI loops)

**Enable MIDI Clock:**
- Go to **Preferences → MIDI Clock**
- Enable **Send MIDI Clock**
- (Optional) Adjust **MIDI Clock Sending Offset** if timing feels off

**Show Master Clock Panel:**
- Go to **Preferences → Global Settings**
- Enable **Show Global Section**
- In Traktor's top bar, click the **SEND** play button to start sending clock

#### 3. Connect in Lightbox
- Set Clock Source to **MIDI**
- Select your loopMIDI port from dropdown
- BPM syncs automatically when Traktor is playing

**Requirements**: Chrome browser, HTTPS (or localhost)

*Reference: [Native Instruments MIDI Clock Guide](https://support.native-instruments.com/hc/en-us/articles/209590629-How-to-Send-a-MIDI-Clock-Sync-Signal-in-TRAKTOR)*

### Audio Modes (when Clock = Audio)

| Mode | Behavior |
|------|----------|
| **Beat** | Flash on kick drums, exponential decay (DJ recommended) |
| **Volume** | Brightness follows overall audio level |

### Spectrum Mode

When Clock is set to Audio, you can enable Spectrum Mode in the Color tab. This ignores the selected color and picks hue based on dominant frequencies (Traktor-style):
- Bass → Red/Orange
- Mids → Yellow/Green
- Highs → Blue/Purple

## Beat Detection

The beat detection system uses onset detection:
1. Tracks bass frequency energy over time
2. Detects transients (sudden increases) above adaptive threshold
3. Debounces to prevent double triggers
4. Estimates BPM from kick intervals

Works with any BPM (auto-detects 40-200+ BPM range).

## DJ Color Presets

| Key | Color |
|-----|-------|
| 1 | White |
| 2 | Warm White |
| 3 | Hot Pink |
| 4 | Electric Blue |
| 5 | Deep Purple |
| 6 | Neon Green |
| 7 | Cyan |
| 8 | Amber |
| 9 | Red |

## Effects

| Effect | Clock Off | Clock On |
|--------|-----------|----------|
| **Solid** | Static color | Flash on beat, decay between |
| **Pulse** | Smooth oscillation (Speed slider) | Synced to clock BPM |
| **Breathe** | Slow sine wave (Speed slider) | Synced to clock BPM |
| **Strobe** | Fast on/off (Speed slider) | Flash on each beat |

When Clock is active, the Speed slider is disabled for Pulse/Breathe/Strobe effects - they sync to the clock BPM instead.

## Project Structure

```
src/
├── components/
│   ├── LightingCanvas.tsx   # Full-screen color display
│   ├── ControlPanel.tsx     # Floating control panel
│   ├── ColorControls.tsx    # Color picker + presets + Spectrum toggle
│   ├── EffectControls.tsx   # Effect selector + clock sync indicator
│   └── ClockControls.tsx    # Clock source, BPM, tap tempo
├── hooks/
│   ├── useLightingStore.ts  # Zustand store (color, effects, clock)
│   ├── useLightingEffect.ts # Effect animation + clock sync
│   ├── useAudioAnalyzer.ts  # Beat detection + BPM estimation
│   └── useMidiClock.ts      # Web MIDI API integration
└── lib/
    ├── colors.ts            # DJ color palette
    └── effects.ts           # Effect implementations
```
