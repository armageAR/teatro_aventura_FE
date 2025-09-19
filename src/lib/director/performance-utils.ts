import type { Performance } from '@/lib/types/performance';
import type { Play } from '@/lib/types/play';

export const extractPlaysFromResponse = (data: unknown): Play[] => {
  if (Array.isArray(data)) return data as Play[];
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.plays)) return obj.plays as Play[];
    if (Array.isArray(obj.data)) return obj.data as Play[];
  }
  return [];
};

export const extractPerformancesFromResponse = (
  data: unknown,
): Performance[] => {
  if (Array.isArray(data)) return data as Performance[];
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.performances))
      return obj.performances as Performance[];
    if (Array.isArray(obj.data)) return obj.data as Performance[];
  }
  return [];
};

export const parsePerformanceDateTime = (
  performance: Performance,
): Date | null => {
  const rawDate = performance.date?.trim();
  if (!rawDate) return null;

  const tryParse = (value: string): Date | null => {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  // If the backend already provides an ISO timestamp, use it directly.
  if (rawDate.includes('T')) {
    const parsed = tryParse(rawDate);
    if (parsed) return parsed;
  }

  const rawTime = performance.time?.trim();
  if (rawTime) {
    const normalizedTime = (() => {
      if (/^\d{2}:\d{2}$/.test(rawTime)) return `${rawTime}:00`;
      if (/^\d{2}:\d{2}:\d{2}$/.test(rawTime)) return rawTime;
      return rawTime;
    })();
    const candidate = `${rawDate}${rawDate.includes('T') ? '' : 'T'}${normalizedTime}`;
    const parsedCandidate = tryParse(candidate);
    if (parsedCandidate) return parsedCandidate;
  }

  // Fall back to midnight on the provided date when no time is given.
  if (!rawDate.includes('T')) {
    const midnightCandidate = tryParse(`${rawDate}T00:00:00`);
    if (midnightCandidate) return midnightCandidate;
  }

  return tryParse(rawDate);
};

export const formatPerformanceTime = (performance: Performance): string => {
  const parsed = parsePerformanceDateTime(performance);
  if (!parsed) return '';
  return `${String(parsed.getHours()).padStart(2, '0')}:${String(parsed.getMinutes()).padStart(2, '0')}`;
};
