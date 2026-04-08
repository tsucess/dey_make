import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../context/LanguageContext', async () => {
  const actual = await vi.importActual('../../locales/translations');
  return { useLanguage: () => ({ locale: 'en', setLocale: vi.fn(), t: actual.createTranslator('en') }) };
});

import { CreateDropdown } from './CreateDropdown';

describe('CreateDropdown', () => {
  it('labels the live creation entry as create live', () => {
    render(
      <MemoryRouter>
        <CreateDropdown isVisible />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: /create live/i })).toHaveAttribute('href', '/create-live');
  });
});