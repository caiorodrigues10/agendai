import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { PostDetail, buildPostShareUrl, buildProfileShareUrl } from './PostDetail';
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

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('buildProfileShareUrl — link público do perfil', () => {
  it('usa a origem pública (VITE_PUBLIC_SITE_URL) e a rota /s/salon/:id', () => {
    vi.stubEnv('VITE_PUBLIC_SITE_URL', 'https://agendai.example.com');

    expect(buildProfileShareUrl('salão 1')).toBe(
      'https://agendai.example.com/s/salon/sal%C3%A3o%201',
    );
  });

  it('sem a env, cai na origem atual da janela', () => {
    expect(buildProfileShareUrl('salon')).toBe(`${window.location.origin}/s/salon/salon`);
  });

  it('ignora barra final da env e deixa de mandar ?tab=profile (o back faz o redirect)', () => {
    vi.stubEnv('VITE_PUBLIC_SITE_URL', 'https://agendai.example.com/');

    const url = buildProfileShareUrl('salon');

    expect(url).toBe('https://agendai.example.com/s/salon/salon');
    expect(url).not.toContain('//s/');
    expect(url).not.toContain('?tab=profile');
    expect(url).not.toContain('/queue/');
  });
});

describe('buildPostShareUrl', () => {
  it('mantém a rota de post da SPA', () => {
    expect(buildPostShareUrl('salon', 'p1')).toBe(
      `${window.location.origin}/saloes/salon/posts/p1`,
    );
  });
});
