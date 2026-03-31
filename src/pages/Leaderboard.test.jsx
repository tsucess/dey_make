import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../context/LanguageContext', async () => {
  const actual = await vi.importActual('../locales/translations');
  const t = actual.createTranslator('es');

  return {
    useLanguage: () => ({ locale: 'es', setLocale: vi.fn(), t }),
  };
});

vi.mock('../services/api', async () => {
  const actual = await vi.importActual('../services/api');

  return {
    ...actual,
    api: {
      ...actual.api,
      getLeaderboard: vi.fn(),
    },
  };
});

import { api } from '../services/api';
import Leaderboard from './Leaderboard';

describe('Leaderboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders translated leaderboard tabs and empty state', async () => {
    api.getLeaderboard.mockResolvedValue({
      data: { podium: [], standings: [], currentUserRank: null },
    });

    render(<Leaderboard />);

    expect(screen.getByRole('button', { name: 'Diario' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Semanal' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mensual' })).toBeInTheDocument();

    await waitFor(() => expect(api.getLeaderboard).toHaveBeenCalledWith('daily'));
    expect(await screen.findByText('Actualmente ocupas')).toBeInTheDocument();
    expect(screen.getByText('Aún no hay entradas en la tabla.')).toBeInTheDocument();
  });

  it('shows the authenticated user rank when the API returns it', async () => {
    api.getLeaderboard.mockResolvedValue({
      data: {
        podium: [],
        standings: [{ userId: 2, rank: 4, trend: 'steady', score: 40, videosCount: 2, user: { fullName: 'Creator Four', avatarUrl: '' } }],
        currentUserRank: { userId: 2, rank: 4, trend: 'steady', score: 40, videosCount: 2, user: { fullName: 'Creator Four', avatarUrl: '' } },
      },
    });

    render(<Leaderboard />);

    await waitFor(() => expect(api.getLeaderboard).toHaveBeenCalledWith('daily'));
    expect(await screen.findByText('4')).toBeInTheDocument();
    expect(screen.queryByText('—')).not.toBeInTheDocument();
  });
});