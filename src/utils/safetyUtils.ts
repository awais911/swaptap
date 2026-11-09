import { UserProfile } from '../types';

export const DAILY_TASK_LIMIT = 25;

export type DripFeedPacing = 'organic' | 'steady' | 'batch';

export interface DripFeedOption {
  id: DripFeedPacing;
  title: string;
  viewsPerHour: number;
  badge: string;
  recommended: boolean;
  description: string;
  safetyRating: 'Maximum' | 'High' | 'Standard';
}

export const DRIP_FEED_OPTIONS: Record<DripFeedPacing, DripFeedOption> = {
  organic: {
    id: 'organic',
    title: 'Organic Pacing',
    viewsPerHour: 6,
    badge: 'Safest',
    recommended: true,
    description: 'Releases ~5–8 views/hour. Simulates natural discovery without triggering algorithmic velocity spikes.',
    safetyRating: 'Maximum',
  },
  steady: {
    id: 'steady',
    title: 'Steady Flow',
    viewsPerHour: 15,
    badge: 'Balanced',
    recommended: false,
    description: 'Releases ~12–15 views/hour. Balanced flow ideal for established channels with existing regular traffic.',
    safetyRating: 'High',
  },
  batch: {
    id: 'batch',
    title: 'Standard Distribution',
    viewsPerHour: 28,
    badge: 'Fast',
    recommended: false,
    description: 'Releases ~25–30 views/hour into the community pool for time-sensitive launches.',
    safetyRating: 'Standard',
  },
};

/**
 * Returns current date formatted as YYYY-MM-DD in user's local timezone
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates user's daily task limit status
 */
export function getDailyTasksStatus(userProfile: UserProfile | null): {
  used: number;
  remaining: number;
  max: number;
  isLimitReached: boolean;
  date: string;
} {
  const today = getTodayDateString();
  const max = DAILY_TASK_LIMIT;

  if (!userProfile) {
    return {
      used: 0,
      remaining: max,
      max,
      isLimitReached: false,
      date: today,
    };
  }

  const isSameDay = userProfile.dailyTasksDate === today;
  const used = isSameDay ? (userProfile.dailyTasksCount || 0) : 0;
  const remaining = Math.max(0, max - used);
  const isLimitReached = used >= max;

  return {
    used,
    remaining,
    max,
    isLimitReached,
    date: today,
  };
}

/**
 * Generates natural randomized watch time jitter (30 to 33 seconds)
 * to avoid artificial fixed-interval robotic signatures.
 */
export function getRandomizedWatchDuration(baseSeconds = 30): number {
  // Adds 0 to 3 seconds of random human variance
  const jitter = Math.floor(Math.random() * 4);
  return baseSeconds + jitter;
}

/**
 * Validates video URLs against allowed protocols and known video platforms
 */
export function isSafeEmbedUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();

  // Reject dangerous protocols
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('vbscript:') ||
    trimmed.startsWith('file:')
  ) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return false;
    }

    const host = parsed.hostname.toLowerCase();
    const isYouTube =
      host.includes('youtube.com') ||
      host.includes('youtu.be') ||
      host.includes('youtube-nocookie.com');
    const isTikTok = host.includes('tiktok.com');
    const isInstagram = host.includes('instagram.com');

    return isYouTube || isTikTok || isInstagram;
  } catch {
    return false;
  }
}
