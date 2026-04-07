import { describe, expect, it } from 'vitest';
import {
  FALLBACK_AVATAR,
  FALLBACK_THUMBNAIL,
  buildVideoAnalyticsLink,
  buildVideoLink,
  buildShareUrl,
  formatCompactNumber,
  filterActiveLiveVideos,
  getVideoProcessingStatus,
  getProfileAvatar,
  getProfileName,
  getVideoThumbnail,
  hasPostLiveAnalytics,
  mapVideoToCardProps,
} from './content';

describe('content helpers', () => {
  it('formats compact numbers safely', () => {
    expect(formatCompactNumber('abc')).toBe('0');
    expect(formatCompactNumber(999)).toBe('999');
    expect(formatCompactNumber(1500)).toBe('1.5K');
  });

  it('resolves profile names from strings and common fields', () => {
    expect(getProfileName('  Ada Lovelace  ')).toBe('Ada Lovelace');
    expect(getProfileName({ name: 'Grace Hopper' })).toBe('Grace Hopper');
    expect(getProfileName({ username: 'ghopper' })).toBe('ghopper');
    expect(getProfileName({})).toBe('Unknown creator');
  });

  it('returns avatar and thumbnail fallbacks when fields are missing', () => {
    expect(getProfileAvatar({})).toBe(FALLBACK_AVATAR);
    expect(getVideoThumbnail(null)).toBe(FALLBACK_THUMBNAIL);
    expect(getVideoThumbnail({ type: 'image', mediaUrl: 'https://cdn.example/image.png' })).toBe('https://cdn.example/image.png');
  });

  it('maps video card props using creator helper resolution', () => {
    expect(mapVideoToCardProps({
      id: 7,
      title: 'Launch day',
      thumbnailUrl: 'https://cdn.example/thumb.jpg',
      isLive: true,
      processingStatus: 'processing',
      category: { label: 'Technology' },
      creator: { username: 'rise', avatarUrl: 'https://cdn.example/avatar.jpg' },
    })).toEqual({
      id: 7,
      thumb: 'https://cdn.example/thumb.jpg',
      title: 'Launch day',
      author: 'rise',
      avatarUrl: 'https://cdn.example/avatar.jpg',
      tags: ['Technology'],
      live: true,
      processingStatus: 'processing',
      creatorId: null,
      hasAnalytics: false,
      analyticsHref: null,
    });
  });

  it('detects post-live analytics links for ended lives', () => {
    const video = { id: 21, isLive: false, liveEndedAt: '2026-04-04T12:12:30Z', liveAnalytics: { peakViewers: 17 } };

    expect(hasPostLiveAnalytics(video)).toBe(true);
    expect(buildVideoAnalyticsLink(video)).toBe('/video/21/analytics');
  });

  it('normalizes video processing status safely', () => {
    expect(getVideoProcessingStatus({ processingStatus: ' Processing ' })).toBe('processing');
    expect(getVideoProcessingStatus({ upload: { processingStatus: 'failed' } })).toBe('failed');
    expect(getVideoProcessingStatus({})).toBe('completed');
  });

  it('builds a share url from the current origin', () => {
    expect(buildShareUrl(42)).toBe(`${window.location.origin}/video/42`);
    expect(buildShareUrl(42, true)).toBe(`${window.location.origin}/live/42`);
    expect(buildVideoLink({ id: 7, isLive: true })).toBe('/live/7');
  });

  it('normalizes live flags before filtering or building links', () => {
    expect(buildVideoLink({ id: 8, isLive: 'true' })).toBe('/live/8');
    expect(buildVideoLink({ id: 9, isLive: 'false' })).toBe('/video/9');
    expect(filterActiveLiveVideos([
      { id: 1, isLive: 'true' },
      { id: 2, isLive: 'false' },
      { id: 3, isLive: 1 },
    ]).map((video) => video.id)).toEqual([1, 3]);
  });
});