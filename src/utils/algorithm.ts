import { STATION_LIST, getTravelTime } from '../data/stations';
import type { MiddleResult } from '../types';

function variance(times: number[]): number {
  const mean = times.reduce((a, b) => a + b, 0) / times.length;
  return times.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / times.length;
}

export function findMiddleStation(origins: string[]): MiddleResult {
  let bestStation = '';
  let bestVariance = Infinity;
  let bestTimes: number[] = [];

  for (const candidate of STATION_LIST) {
    const times = origins.map((origin) => getTravelTime(origin, candidate));

    // Skip if any time is unreachable
    if (times.some((t) => t >= 999)) continue;

    const v = variance(times);
    if (v < bestVariance) {
      bestVariance = v;
      bestStation = candidate;
      bestTimes = times;
    }
  }

  return {
    middleStation: bestStation || STATION_LIST[0],
    travelTimes: bestTimes,
    origins,
  };
}
