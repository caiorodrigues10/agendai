/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { OwnerBotSection } from './OwnerBotSection';
import {
  ownerBotApi,
  type OwnerBotCatalog,
  type OwnerBotPreferences,
  type OwnerBotStatus,
} from '../../infra/ownerBotApi';

vi.mock('../../infra/ownerBotApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../infra/ownerBotApi')>();
  return {
    ...actual,
    ownerBotApi: {
      ...actual.ownerBotApi,
      getStatus: vi.fn(),
      createLinkCode: vi.fn(),
      unlink: vi.fn(),
      getPreferences: vi.fn(),
      updatePreferences: vi.fn(),
      getCatalog: vi.fn(),
      getActionLogs: vi.fn(),
    },
  };
});

const defaultPrefs: OwnerBotPreferences = {
  enabled: true,
  blocked: false,
  briefingEnabled: true,
  briefingTime: '07:30',
  summaryEnabled: true,
  summaryTime: '21:00',
  alertsEnabled: true,
  alertTypes: ['CLIENT_LATE'],
  tone: 'FRIENDLY',
  language: 'pt-BR',
};

const catalog: OwnerBotCatalog = {
  categories: [
    {
      id: 'AGENDA',
      label: 'Agenda',
      commands: [
        {
          id: 'agenda.today',
          category: 'AGENDA',
          categoryLabel: 'Agenda',
          risk: 'READ',
          riskLabel: 'Consulta',
          description: 'Ver a agenda do dia',
          examples: ['agenda'],
        },
      ],
    },
  ],
  total: 1,
};

function mockBasics(
  status: OwnerBotStatus = linkedStatus,
  prefs: OwnerBotPreferences = defaultPrefs
) {
  vi.mocked(ownerBotApi.getStatus).mockResolvedValue(status);
  vi.mocked(ownerBotApi.getPreferences).mockResolvedValue(prefs);
  vi.mocked(ownerBotApi.getCatalog).mockResolvedValue(catalog);
  vi.mocked(ownerBotApi.getActionLogs).mockResolvedValue([]);
}

const linkedStatus: OwnerBotStatus = {
  linked: true,
  phoneMasked: '(11) 99999-9999',
  linkedAt: '2026-10-20T12:00:00.000Z',
  botPhone: '5511900000000',
  shopPhoneMasked: '(11) 99999-9999',
  highlights: ['Ver a agenda do dia', 'Agendar um novo horário'],
  recentActions: [
    { id: 'a1', action: 'SCHEDULE', status: 'SUCCESS', createdAt: '2026-10-27T10:00:00.000Z' },
  ],
};

const unlinkedStatus: OwnerBotStatus = {
  linked: false,
  phoneMasked: null,
  linkedAt: null,
  botPhone: '5511900000000',
  shopPhoneMasked: '(11) 99999-9999',
  highlights: ['Ver a agenda do dia'],
  recentActions: [],
};

describe('OwnerBotSection', () => {
  afterEach(() => vi.clearAllMocks());

  it('mostra o estado vinculado e o link para conversar com o assistente', async () => {
    mockBasics();

    render(<OwnerBotSection barbershopId="shop-1" onNotify={vi.fn()} />);

    expect(await screen.findByText('Assistente ativo')).toBeInTheDocument();
    expect(screen.getByText(/\(11\) 99999-9999/)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Conversar com o assistente/i })
    ).toHaveAttribute('href', 'https://wa.me/5511900000000');
    expect(screen.getByText('Ver a agenda do dia')).toBeInTheDocument();
    expect(screen.getByText('Agendamento criado')).toBeInTheDocument();
  });

  it('avisa quando o número vinculado não é o cadastrado no estabelecimento', async () => {
    mockBasics({ ...linkedStatus, phoneMasked: '(11) 88888-8888' });

    render(<OwnerBotSection barbershopId="shop-1" onNotify={vi.fn()} />);

    expect(await screen.findByText(/só responde no número vinculado/i)).toBeInTheDocument();
  });

  it('gera o código de vínculo e mostra a contagem regressiva', async () => {
    mockBasics(unlinkedStatus);
    vi.mocked(ownerBotApi.createLinkCode).mockResolvedValue({
      code: 'AB12CD',
      expiresAt: new Date(Date.now() + 600_000).toISOString(),
      expiresInSeconds: 600,
    });

    render(<OwnerBotSection barbershopId="shop-1" onNotify={vi.fn()} />);

    fireEvent.click(await screen.findByRole('button', { name: /Gerar código de vínculo/i }));

    expect(await screen.findByText('AB12CD')).toBeInTheDocument();
    expect(screen.getByTestId('owner-bot-countdown')).toHaveTextContent('Expira em');
  });

  it('desvincula somente depois da confirmação', async () => {
    mockBasics();
    vi.mocked(ownerBotApi.unlink).mockResolvedValue({ linked: false });

    render(<OwnerBotSection barbershopId="shop-1" onNotify={vi.fn()} />);

    fireEvent.click(await screen.findByRole('button', { name: /Desvincular/i }));
    const dialog = await screen.findByRole('alertdialog');
    expect(ownerBotApi.unlink).not.toHaveBeenCalled();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Desvincular' }));

    await waitFor(() => expect(ownerBotApi.unlink).toHaveBeenCalledWith('shop-1'));
  });

  it('mostra erro quando a consulta falha', async () => {
    vi.mocked(ownerBotApi.getStatus).mockRejectedValue(new Error('boom'));
    vi.mocked(ownerBotApi.getPreferences).mockResolvedValue(defaultPrefs);
    vi.mocked(ownerBotApi.getCatalog).mockResolvedValue(catalog);
    vi.mocked(ownerBotApi.getActionLogs).mockResolvedValue([]);

    render(<OwnerBotSection barbershopId="shop-1" onNotify={vi.fn()} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('boom');
  });

  it('mostra o painel de preferências com briefing e resumo', async () => {
    mockBasics();

    render(<OwnerBotSection barbershopId="shop-1" onNotify={vi.fn()} />);

    expect(await screen.findByTestId('owner-bot-prefs')).toBeInTheDocument();
    expect(screen.getByText('Enviar briefing de manhã')).toBeInTheDocument();
    expect(screen.getByText('Enviar resumo à noite')).toBeInTheDocument();
  });

  it('exibe o catálogo de comandos do segmento', async () => {
    mockBasics();

    render(<OwnerBotSection barbershopId="shop-1" onNotify={vi.fn()} />);

    const catalogPanel = await screen.findByTestId('owner-bot-catalog');
    expect(catalogPanel).toHaveTextContent('Ver a agenda do dia');
    expect(catalogPanel).toHaveTextContent('Consulta');
  });

  it('bloqueia o assistente somente depois da confirmação', async () => {
    mockBasics();
    vi.mocked(ownerBotApi.updatePreferences).mockResolvedValue({ ...defaultPrefs, blocked: true });
    vi.mocked(ownerBotApi.getPreferences)
      .mockResolvedValueOnce(defaultPrefs)
      .mockResolvedValue({ ...defaultPrefs, blocked: true });

    render(<OwnerBotSection barbershopId="shop-1" onNotify={vi.fn()} />);

    fireEvent.click(await screen.findByRole('button', { name: /Bloquear assistente/i }));
    const dialog = await screen.findByRole('alertdialog');
    expect(ownerBotApi.updatePreferences).not.toHaveBeenCalled();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Bloquear' }));

    await waitFor(() =>
      expect(ownerBotApi.updatePreferences).toHaveBeenCalledWith('shop-1', { blocked: true })
    );
    expect(await screen.findByTestId('owner-bot-blocked')).toBeInTheDocument();
  });

  it('desbloqueia o assistente quando está bloqueado', async () => {
    mockBasics(linkedStatus, { ...defaultPrefs, blocked: true });
    vi.mocked(ownerBotApi.updatePreferences).mockResolvedValue({ ...defaultPrefs, blocked: false });

    render(<OwnerBotSection barbershopId="shop-1" onNotify={vi.fn()} />);

    fireEvent.click(await screen.findByRole('button', { name: /Desbloquear/i }));

    await waitFor(() =>
      expect(ownerBotApi.updatePreferences).toHaveBeenCalledWith('shop-1', { blocked: false })
    );
  });

  it('salva as preferências de briefing', async () => {
    mockBasics();
    vi.mocked(ownerBotApi.updatePreferences).mockResolvedValue({
      ...defaultPrefs,
      briefingTime: '08:00',
    });

    render(<OwnerBotSection barbershopId="shop-1" onNotify={vi.fn()} />);

    const timeInput = (await screen.findByTestId('owner-bot-prefs')).querySelector(
      'input[type="time"]'
    ) as HTMLInputElement;
    fireEvent.change(timeInput, { target: { value: '08:00' } });

    fireEvent.click(screen.getByRole('button', { name: /Salvar preferências/i }));

    await waitFor(() =>
      expect(ownerBotApi.updatePreferences).toHaveBeenCalledWith(
        'shop-1',
        expect.objectContaining({ briefingTime: '08:00' })
      )
    );
  });
});
