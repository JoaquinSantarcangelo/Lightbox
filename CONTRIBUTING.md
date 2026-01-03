# Contributing to Lightbox

Thanks for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/lightbox.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/my-feature`
5. Start dev server: `npm run dev`

## Development

### Code Style

- TypeScript strict mode
- Functional components with hooks
- Tailwind CSS with `stone` palette
- No emojis in code unless requested

### Project Structure

```
src/
├── components/   # React components
├── hooks/        # Custom hooks (state, audio, MIDI)
├── lib/          # Utilities and constants
└── types/        # TypeScript definitions
```

### Commands

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run lint      # Run ESLint
npx tsc --noEmit  # Type check
```

## Making Changes

### Adding Effects

1. Define in `src/lib/effects.ts`
2. Add type to `src/types/index.ts`
3. Add clock sync in `src/hooks/useLightingEffect.ts` if needed
4. Update `CLOCK_SYNCED_EFFECTS` in `EffectControls.tsx` if synced

### Adding Clock Sources

1. Add to `ClockSource` type
2. Create hook if needed
3. Update `ClockControls.tsx` UI
4. Handle in `useLightingEffect.ts`

## Submitting Changes

1. Ensure code compiles: `npx tsc --noEmit`
2. Test your changes manually
3. Commit with clear message
4. Push to your fork
5. Open a Pull Request

### Commit Messages

Use conventional commits:

```
feat: add rainbow effect
fix: resolve MIDI connection issue
docs: update README
refactor: simplify audio analyzer
```

## Questions?

Open an issue for bugs, feature requests, or questions.
