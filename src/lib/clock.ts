import type { ClockSource } from '@/types';

interface EffectiveBpmOptions {
  clockSource: ClockSource;
  manualBpm: number;
  tapTimes: number[];
  audioBpm?: number;
  midiBpm?: number;
}

export function getEffectiveBpm({
  clockSource,
  manualBpm,
  tapTimes,
  audioBpm,
  midiBpm,
}: EffectiveBpmOptions): number {
  if (clockSource === 'audio') {
    return audioBpm ?? 0;
  }

  if (clockSource === 'midi') {
    return midiBpm ?? 0;
  }

  if (clockSource === 'manual') {
    return manualBpm;
  }

  if (clockSource === 'tap' && tapTimes.length >= 2) {
    const intervals: number[] = [];
    for (let i = 1; i < tapTimes.length; i++) {
      intervals.push(tapTimes[i] - tapTimes[i - 1]);
    }
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    return Math.round(60000 / avgInterval);
  }

  return 0;
}
