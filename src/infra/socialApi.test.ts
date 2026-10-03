import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from './apiClient';
import { socialApi } from './socialApi';

vi.mock('./apiClient', () => ({ apiClient: vi.fn() }));
vi.mock('./authStorage', () => ({ authStorage: { getAccessToken: vi.fn(() => null) } }));
import { authStorage } from './authStorage';

describe('socialApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    vi.mocked(authStorage.getAccessToken).mockReturnValue(null);
    vi.mocked(apiClient).mockResolvedValue({ data: [] });
  });

  it('permite consultar posts sem sessão', async () => {
    await socialApi.getPost('salon', 'post');
    expect(apiClient).toHaveBeenCalledWith('/api/salons/salon/posts/post');
    expect(socialApi.canComment()).toBe(false);
  });

  it('usa a sessão OTP sem tentar renovar uma sessão de salão', async () => {
    localStorage.setItem('agendai_client_portal_access', 'client-session');
    await socialApi.comment('salon', 'post', 'Adorei!');
    expect(socialApi.canComment()).toBe(true);
    expect(apiClient).toHaveBeenCalledWith('/api/salons/salon/posts/post/comments', 'POST', { content: 'Adorei!' }, 'client-session', { retried: true });
  });

  it('prioriza a sessão staff quando as duas estão presentes', async () => {
    localStorage.setItem('agendai_client_portal_access', 'client-session');
    vi.mocked(authStorage.getAccessToken).mockReturnValue('staff-session');
    await socialApi.deleteComment('salon', 'post', 'comment');
    expect(apiClient).toHaveBeenCalledWith('/api/salons/salon/posts/post/comments/comment', 'DELETE', undefined, 'staff-session', { retried: false });
  });

  it('preserva os metadados de paginação', async () => {
    const page = { data: [], meta: { page: 2, limit: 20, total: 25 } };
    vi.mocked(apiClient).mockResolvedValue(page);
    expect(await socialApi.comments('salon', 'post', 2)).toEqual(page);
  });

  it('não envia token do cliente para moderar marcações', async () => {
    localStorage.setItem('agendai_client_portal_access', 'client-session');
    await socialApi.moderateTag('salon', 'tag', true);
    expect(apiClient).toHaveBeenCalledWith('/api/salons/salon/tags/tag', 'PATCH', { approve: true }, '');
  });

  it('escapa segmentos de URLs e reavalia a sessão após logout', async () => {
    sessionStorage.setItem('agendai_client_portal_access', 'client-session');
    expect(socialApi.canComment()).toBe(true);
    sessionStorage.clear();
    expect(socialApi.canComment()).toBe(false);
    await socialApi.getPost('salon/other', 'post#1');
    expect(apiClient).toHaveBeenCalledWith('/api/salons/salon%2Fother/posts/post%231');
  });
});
