import { describe, expect, it } from 'vitest';
import { dictionaries } from './translations';

const localeEntries = Object.entries(dictionaries).filter(([locale]) => !['en', 'en-GB'].includes(locale));

describe('translations live flow coverage', () => {
  for (const [locale, dictionary] of localeEntries) {
    it(`provides locale-specific create-live copy for ${locale}`, () => {
      expect(dictionary.upload.liveFlow.setupTitle).toBeTruthy();
      expect(dictionary.upload.liveFlow.previewAction).toBeTruthy();
      expect(dictionary.upload.errors.titleRequired).toBeTruthy();
      expect(dictionary.upload.liveFlow.setupTitle).not.toBe(dictionaries.en.upload.liveFlow.setupTitle);
      expect(dictionary.upload.liveFlow.previewAction).not.toBe(dictionaries.en.upload.liveFlow.previewAction);
      expect(dictionary.upload.errors.titleRequired).not.toBe(dictionaries.en.upload.errors.titleRequired);
    });
  }
});