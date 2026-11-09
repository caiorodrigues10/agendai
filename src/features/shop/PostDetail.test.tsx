import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { PostDetail } from './PostDetail';
import type { PublicSocialPost } from '../../infra/socialApi';

const post: PublicSocialPost = {
  id: 'post-1', type: 'announcement', content: '', createdAt: Date.now(),
  likes: 0, shopName: 'Escritório', postMode: 'appointments',
  templateKey: 'advocacia-consumidor', ctaText: 'Salve esta lista',
};

describe('PostDetail action labels', () => {
  it('keeps legal art copy separate from the appointment link', () => {
    render(<MemoryRouter><PostDetail salonId="office" post={post} /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Agendar atendimento' })).toHaveAttribute('href', '/queue/office?tab=appointments');
    expect(screen.queryByRole('link', { name: 'Salve esta lista' })).not.toBeInTheDocument();
  });

  it('preserves the custom appointment label for existing generic posts', () => {
    render(<MemoryRouter><PostDetail salonId="salon" post={{ ...post, templateKey: 'servico-destaque', ctaText: 'Agendar corte' }} /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Agendar corte' })).toHaveAttribute('href', '/queue/salon?tab=appointments');
  });
});
