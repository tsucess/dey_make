import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../context/LanguageContext', async () => {
  const actual = await vi.importActual('../../locales/translations');
  const t = actual.createTranslator('en');

  return {
    useLanguage: () => ({ locale: 'en', setLocale: vi.fn(), t }),
  };
});

import BottomNav from './BottomNav';

describe('BottomNav', () => {
  it('includes a live discovery link', () => {
    render(
      <MemoryRouter initialEntries={['/home']}>
        <BottomNav />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Live' })).toHaveAttribute('href', '/live');
  });
});