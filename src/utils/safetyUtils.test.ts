import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DAILY_TASK_LIMIT,
  DRIP_FEED_OPTIONS,
  getDailyTasksStatus,
  getRandomizedWatchDuration,
  isSafeEmbedUrl,
  getTodayDateString,
} from './safetyUtils.js';
import { UserProfile } from '../types/index.js';

test('DAILY_TASK_LIMIT constant is set to 25', () => {
  assert.equal(DAILY_TASK_LIMIT, 25);
});

test('DRIP_FEED_OPTIONS provides organic, steady, and batch modes', () => {
  assert.ok(DRIP_FEED_OPTIONS.organic);
  assert.ok(DRIP_FEED_OPTIONS.steady);
  assert.ok(DRIP_FEED_OPTIONS.batch);
  assert.equal(DRIP_FEED_OPTIONS.organic.recommended, true);
  assert.equal(DRIP_FEED_OPTIONS.organic.safetyRating, 'Maximum');
  assert.ok(DRIP_FEED_OPTIONS.organic.viewsPerHour < DRIP_FEED_OPTIONS.steady.viewsPerHour);
  assert.ok(DRIP_FEED_OPTIONS.steady.viewsPerHour < DRIP_FEED_OPTIONS.batch.viewsPerHour);
});

test('getDailyTasksStatus handles null userProfile', () => {
  const status = getDailyTasksStatus(null);
  assert.equal(status.used, 0);
  assert.equal(status.remaining, 25);
  assert.equal(status.max, 25);
  assert.equal(status.isLimitReached, false);
});

test('getDailyTasksStatus handles user on same day with 12 tasks', () => {
  const today = getTodayDateString();
  const mockUser: Partial<UserProfile> = {
    dailyTasksCount: 12,
    dailyTasksDate: today,
  };
  const status = getDailyTasksStatus(mockUser as UserProfile);
  assert.equal(status.used, 12);
  assert.equal(status.remaining, 13);
  assert.equal(status.isLimitReached, false);
});

test('getDailyTasksStatus detects limit reached at 25 tasks', () => {
  const today = getTodayDateString();
  const mockUser: Partial<UserProfile> = {
    dailyTasksCount: 25,
    dailyTasksDate: today,
  };
  const status = getDailyTasksStatus(mockUser as UserProfile);
  assert.equal(status.used, 25);
  assert.equal(status.remaining, 0);
  assert.equal(status.isLimitReached, true);
});

test('getDailyTasksStatus resets counter if date is yesterday', () => {
  const mockUser: Partial<UserProfile> = {
    dailyTasksCount: 25,
    dailyTasksDate: '2025-01-01',
  };
  const status = getDailyTasksStatus(mockUser as UserProfile);
  assert.equal(status.used, 0);
  assert.equal(status.remaining, 25);
  assert.equal(status.isLimitReached, false);
});

test('getRandomizedWatchDuration produces duration within [30, 33] bounds', () => {
  for (let i = 0; i < 50; i++) {
    const duration = getRandomizedWatchDuration(30);
    assert.ok(duration >= 30, `Expected >= 30, got ${duration}`);
    assert.ok(duration <= 33, `Expected <= 33, got ${duration}`);
  }
});

test('isSafeEmbedUrl correctly allows valid platform URLs', () => {
  assert.equal(isSafeEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), true);
  assert.equal(isSafeEmbedUrl('https://youtu.be/dQw4w9WgXcQ'), true);
  assert.equal(isSafeEmbedUrl('https://www.tiktok.com/@creator/video/12345'), true);
  assert.equal(isSafeEmbedUrl('https://www.instagram.com/reel/12345/'), true);
});

test('isSafeEmbedUrl rejects dangerous and invalid URLs', () => {
  assert.equal(isSafeEmbedUrl('javascript:alert(1)'), false);
  assert.equal(isSafeEmbedUrl('data:text/html,<script>alert(1)</script>'), false);
  assert.equal(isSafeEmbedUrl('https://malicious-site.com/exploit.mp4'), false);
  assert.equal(isSafeEmbedUrl(''), false);
  assert.equal(isSafeEmbedUrl('not-a-url'), false);
});
