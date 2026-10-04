/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { DevicesPanel } from './DevicesPanel';
import { authApi, MySession } from '../../infra/authApi';

vi.mock('../../infra/authApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../infra/authApi')>();
  return {
    ...actual,
    authApi: {
      ...actual.authApi,
      mySessions: vi.fn(),
      revokeMySession: vi.fn(),
    },
  };
});

const sessions: MySession[] = [
  {
    id: 's1',
    deviceLabel: 'Chrome em macOS',
    ipAddress: '1.1.1.1',
    userAgent: 'ua-1',
    createdAt: '2026-10-03T11:00:00.000Z',
    lastSeenAt: '2026-10-03T11:55:00.000Z',
    expiresAt: '2026-10-04T11:00:00.000Z',
    status: 'active',
    revokedAt: null,
    revokedReason: null,
    current: true,
  },
  {
    id: 's2',
    deviceLabel: 'Firefox em Windows',
    ipAddress: '2.2.2.2',
    userAgent: 'ua-2',
    createdAt: '2026-10-01T09:00:00.000Z',
    lastSeenAt: '2026-10-01T10:00:00.000Z',
    expiresAt: '2026-10-02T09:00:00.000Z',
    status: 'active',
    revokedAt: null,
    revokedReason: null,
    current: false,
  },
];

describe('DevicesPanel', () => {
  afterEach(() => vi.clearAllMocks());

  it('lista os dispositivos com status e selo do dispositivo atual', async () => {
    vi.mocked(authApi.mySessions).mockResolvedValue({ success: true, data: sessions });

    render(<DevicesPanel />);

    expect(await screen.findByText('Chrome em macOS')).toBeInTheDocument();
    expect(screen.getByText('Firefox em Windows')).toBeInTheDocument();
    expect(screen.getByText('Este dispositivo')).toBeInTheDocument();
    expect(screen.getAllByText('Ativa')).toHaveLength(2);
    expect(screen.getByText('1.1.1.1')).toBeInTheDocument();
  });

  it('encerra a sessão de outro dispositivo sem confirmSelf', async () => {
    vi.mocked(authApi.mySessions).mockResolvedValue({ success: true, data: sessions });
    vi.mocked(authApi.revokeMySession).mockResolvedValue({
      success: true,
      data: { id: 's2', revoked: true, current: false },
    });

    render(<DevicesPanel />);

    const rows = await screen.findByTestId('my-sessions-list');
    const otherRow = rows.querySelector('li:nth-child(2)') as HTMLElement;
    fireEvent.click(within(otherRow).getByRole('button', { name: 'Encerrar' }));
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Encerrar' }));

    await waitFor(() =>
      expect(authApi.revokeMySession).toHaveBeenCalledWith(
        's2',
        { confirmSelf: false },
        expect.any(String),
      ),
    );
    await waitFor(() => expect(authApi.mySessions).toHaveBeenCalledTimes(2));
  });

  it('avisa que a sessão atual desconecta o navegador e envia confirmSelf', async () => {
    vi.mocked(authApi.mySessions).mockResolvedValue({ success: true, data: sessions });
    vi.mocked(authApi.revokeMySession).mockResolvedValue({
      success: true,
      data: { id: 's1', revoked: true, current: true },
    });

    render(<DevicesPanel />);

    const rows = await screen.findByTestId('my-sessions-list');
    const currentRow = rows.querySelector('li:nth-child(1)') as HTMLElement;
    fireEvent.click(within(currentRow).getByRole('button', { name: 'Encerrar' }));

    expect(
      await screen.findByText(/você ficará desconectado deste navegador/i),
    ).toBeInTheDocument();

    const dialog = screen.getByRole('alertdialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Encerrar' }));

    await waitFor(() =>
      expect(authApi.revokeMySession).toHaveBeenCalledWith(
        's1',
        { confirmSelf: true },
        expect.any(String),
      ),
    );
  });

  it('mostra erro quando não carrega os dispositivos', async () => {
    vi.mocked(authApi.mySessions).mockRejectedValue(new Error('boom'));

    render(<DevicesPanel />);

    expect(
      await screen.findByText('Não foi possível carregar os dispositivos.'),
    ).toBeInTheDocument();
  });
});
