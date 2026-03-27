import { describe, expect, it } from 'vitest';
import {
  FALLBACK_AVATAR,
  FALLBACK_THUMBNAIL,
  buildShareUrl,
  formatCompactNumber,
  getProfileAvatar,
  getProfileName,
  getVideoThumbnail,
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
    });
  });

  it('builds a share url from the current origin', () => {
    expect(buildShareUrl(42)).toBe(`${window.location.origin}/video/42`);
  });
});