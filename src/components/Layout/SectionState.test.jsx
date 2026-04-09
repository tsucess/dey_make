import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import SectionState from './SectionState';

describe('SectionState', () => {
  it('renders a title, message, and action when not loading', () => {
    const handleAction = vi.fn();

    render(
      <SectionState
        title="No live streams"
        message="Check back later."
        actionLabel="Go home"
        onAction={handleAction}
      />,
    );

    expect(screen.getByRole('heading', { name: 'No live streams' })).toBeInTheDocument();
    expect(screen.getByText('Check back later.')).toBeInTheDocument();
    screen.getByRole('button', { name: 'Go home' }).click();
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('renders the loading message alongside the spinner state', () => {
    const { container } = render(<SectionState message="Loading results" loading />);

    expect(screen.getByText('Loading results')).toBeInTheDocument();
    expect(container.querySelector('.animate-spin')).not.toBeNull();
  });
});