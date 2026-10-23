/// <reference types="vitest/globals" />
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { LoginPage } from './LoginPage';
import { renderWithProviders } from '../tests/testUtils';
import type { StaffMember } from '../types';

const registerMock = vi.fn();
const navigateMock = vi.fn();
const subscriptionsMeMock = vi.hoisted(() => vi.fn());
const referralGetMock = vi.hoisted(() => vi.fn(() => null as string | null));
const referralSaveMock = vi.hoisted(() => vi.fn());

let authState: { user: StaffMember | null; loading: boolean };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: authState.user,
    loading: authState.loading,
    login: vi.fn(),
    loginWithGoogle: vi.fn(),
    loginWithSavedAccount: vi.fn(),
    forgetSavedAccount: vi.fn(),
    register: registerMock,
    registerWithGoogle: vi.fn(),
    logout: vi.fn(),
    hasRole: () => false,
  }),
}));

vi.mock('../utils/referralStorage', () => ({
  referralStorage: {
    get: referralGetMock,
    set: vi.fn(),
    save: referralSaveMock,
    clear: vi.fn(),
  },
}));

vi.mock('../infra/authStorage', () => ({
  authStorage: {
    getSavedAccounts: () => [],
    hasStoredSession: () => false,
    getUser: () => authState.user,
    getAccessToken: () => 'token-123',
  },
}));

const checkCpfMock = vi.fn();

vi.mock('../infra/authApi', () => ({
  authApi: {
    resendVerification: vi.fn(),
    checkCpf: (...args: unknown[]) => checkCpfMock(...args),
  },
}));

vi.mock('../infra/subscriptionsApi', () => ({
  subscriptionsApi: { me: subscriptionsMeMock },
}));

function resetMocks() {
  authState = { user: null, loading: false };
  checkCpfMock.mockReset();
  checkCpfMock.mockResolvedValue({ success: true, data: { available: true } });
  registerMock.mockReset();
  navigateMock.mockReset();
  subscriptionsMeMock.mockReset();
  subscriptionsMeMock.mockRejectedValue(new Error('offline'));
  referralGetMock.mockReset();
  referralGetMock.mockReturnValue(null);
  referralSaveMock.mockReset();
}

async function fillStep1(overrides: { password?: string } = {}) {
  fireEvent.focus(screen.getByPlaceholderText('seu@email.com'));
  fireEvent.change(screen.getByPlaceholderText('João Silva'), {
    target: { value: 'João Silva' },
  });
  fireEvent.change(screen.getByPlaceholderText('seu@email.com'), {
    target: { value: 'caio@example.com' },
  });
  fireEvent.change(screen.getByPlaceholderText('000.000.000-00'), {
    target: { value: '52998224725' },
  });
  fireEvent.focus(screen.getByPlaceholderText('Crie uma senha segura'));
  fireEvent.change(screen.getByPlaceholderText('Crie uma senha segura'), {
    target: { value: overrides.password ?? 'senha123' },
  });
  fireEvent.click(screen.getByLabelText(/li e aceito os termos de uso/i));
  fireEvent.click(screen.getByLabelText(/consinto com o tratamento dos meus dados/i));
  fireEvent.click(screen.getByRole('button', { name: /^continuar$/i }));
}

async function goToStep2() {
  await fillStep1();
  await waitFor(() =>
    expect(screen.getByRole('heading', { name: 'Qual é o seu negócio?' })).toBeInTheDocument()
  );
}

async function goToStep3(segmentRadio: RegExp) {
  await goToStep2();
  fireEvent.click(screen.getByRole('radio', { name: segmentRadio }));
  fireEvent.click(screen.getByRole('button', { name: /^continuar$/i }));
  await waitFor(() =>
    expect(screen.getByRole('heading', { name: 'Agora, os dados do negócio' })).toBeInTheDocument()
  );
}

function fillStep3(shopName = 'Barbearia Teste') {
  fireEvent.change(screen.getByPlaceholderText(/^nome /i), {
    target: { value: shopName },
  });
  fireEvent.change(screen.getByPlaceholderText('(11) 99999-9999'), {
    target: { value: '(11) 99999-9999' },
  });
  fireEvent.change(screen.getByPlaceholderText('São Paulo'), {
    target: { value: 'São Paulo' },
  });
}

function submitFinal() {
  fireEvent.click(screen.getByRole('button', { name: /criar minha conta/i }));
}

describe('Cadastro em 3 etapas (wizard)', () => {
  beforeEach(resetMocks);

  it('navega entre as etapas e preserva os dados digitados', async () => {
    renderWithProviders(<LoginPage mode="register" />, { route: '/cadastro' });

    await goToStep2();

    // Volta para a etapa 1: o nome digitado continua lá.
    fireEvent.click(screen.getByRole('button', { name: /voltar/i }));
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Comece pelo seu acesso' })).toBeInTheDocument()
    );
    expect(screen.getByPlaceholderText('João Silva')).toHaveValue('João Silva');
    expect(screen.getByPlaceholderText('seu@email.com')).toHaveValue('caio@example.com');

    // Avança de novo e chega na etapa 3 sem re-preencher nada da etapa 1.
    fireEvent.click(screen.getByRole('button', { name: /^continuar$/i }));
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Qual é o seu negócio?' })).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole('radio', { name: /barbearia/i }));
    fireEvent.click(screen.getByRole('button', { name: /^continuar$/i }));
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Agora, os dados do negócio' })).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole('button', { name: /voltar/i }));
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Qual é o seu negócio?' })).toBeInTheDocument()
    );
    expect(screen.getByRole('radio', { name: /barbearia/i })).toBeChecked();
  });

  it('etapa 1 incompleta não avança', async () => {
    renderWithProviders(<LoginPage mode="register" />, { route: '/cadastro' });

    fireEvent.click(screen.getByRole('button', { name: /^continuar$/i }));

    expect(registerMock).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Comece pelo seu acesso' })).toBeInTheDocument();
  });

  it('etapa 2 exige um segmento marcado antes de avançar', async () => {
    renderWithProviders(<LoginPage mode="register" />, { route: '/cadastro' });

    await goToStep2();
    fireEvent.click(screen.getByRole('button', { name: /^continuar$/i }));

    expect(screen.getByRole('heading', { name: 'Qual é o seu negócio?' })).toBeInTheDocument();
    // Toast + label do fieldset podem trazer o mesmo texto.
    expect((await screen.findAllByText('Escolha o tipo do seu negócio')).length).toBeGreaterThan(0);
  });

  it('"Outro" com texto livre avança e o texto vai no payload', async () => {
    registerMock.mockResolvedValue({ ok: true });
    renderWithProviders(<LoginPage mode="register" />, { route: '/cadastro' });

    await goToStep2();
    fireEvent.click(screen.getByRole('radio', { name: /^outro/i }));
    fireEvent.change(screen.getByPlaceholderText(/estúdio de pilates/i), {
      target: { value: 'Estúdio de pilates' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^continuar$/i }));
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Agora, os dados do negócio' })).toBeInTheDocument()
    );
    // Placeholder genérico para OTHER.
    expect(screen.getByPlaceholderText('Nome do seu estabelecimento')).toBeInTheDocument();

    fillStep3('Pilates Centro');
    submitFinal();

    await waitFor(() => expect(registerMock).toHaveBeenCalledTimes(1));
    expect(registerMock.mock.calls[0][0]).toMatchObject({
      businessSegment: 'OTHER',
      businessSegmentOther: 'Estúdio de pilates',
    });
  });

  it('pergunta de público só aparece nos segmentos em que se aplica', async () => {
    renderWithProviders(<LoginPage mode="register" />, { route: '/cadastro' });
    await goToStep2();

    // BARBERSHOP tem público.
    fireEvent.click(screen.getByRole('radio', { name: /barbearia/i }));
    expect(screen.getByRole('radio', { name: /masculino/i })).toBeInTheDocument();

    // PETSHOP não tem (ficha/vocabulário de pet, sem público).
    fireEvent.click(screen.getByRole('radio', { name: /petshop/i }));
    expect(screen.queryByRole('radio', { name: /masculino/i })).toBeNull();
  });

  it('envia uma única chamada com o payload completo no fim da etapa 3', async () => {
    registerMock.mockResolvedValue({ ok: true });
    renderWithProviders(<LoginPage mode="register" />, { route: '/cadastro' });

    await goToStep3(/barbearia/i);
    fillStep3();
    submitFinal();

    await waitFor(() => expect(registerMock).toHaveBeenCalledTimes(1));
    expect(registerMock.mock.calls[0][0]).toMatchObject({
      ownerName: 'João Silva',
      email: 'caio@example.com',
      password: 'senha123',
      cpf: '52998224725',
      barbershopName: 'Barbearia Teste',
      whatsapp: '11999999999',
      businessSegment: 'BARBERSHOP',
      city: 'São Paulo',
      termsAccepted: true,
      lgpdConsent: true,
    });
    expect(registerMock.mock.calls[0][0].schedule).toHaveLength(7);
  });

  it('"E-mail já cadastrado" leva de volta para a etapa 1', async () => {
    registerMock.mockResolvedValue({ ok: false, message: 'E-mail já cadastrado' });
    renderWithProviders(<LoginPage mode="register" />, { route: '/cadastro' });

    await goToStep3(/barbearia/i);
    fillStep3();
    submitFinal();

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Comece pelo seu acesso' })).toBeInTheDocument()
    );
    expect(screen.getByText('E-mail já cadastrado')).toBeInTheDocument();
    // Os dados da etapa 1 continuam preenchidos para o usuário só trocar o e-mail.
    expect(screen.getByPlaceholderText('seu@email.com')).toHaveValue('caio@example.com');
  });

  it('erro de nome do negócio mantém o usuário na etapa 3', async () => {
    registerMock.mockResolvedValue({
      ok: false,
      message: 'Nome do salão deve ter no mínimo 3 caracteres',
    });
    renderWithProviders(<LoginPage mode="register" />, { route: '/cadastro' });

    await goToStep3(/barbearia/i);
    fillStep3();
    submitFinal();

    await waitFor(() => expect(screen.getByText(/nome do salão/i)).toBeInTheDocument());
    expect(screen.getByRole('heading', { name: 'Agora, os dados do negócio' })).toBeInTheDocument();
  });

  it('a senha nunca é gravada em localStorage/sessionStorage', async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    registerMock.mockResolvedValue({ ok: true });
    renderWithProviders(<LoginPage mode="register" />, { route: '/cadastro' });

    await goToStep3(/barbearia/i);
    fillStep3();
    submitFinal();
    await waitFor(() => expect(registerMock).toHaveBeenCalled());

    const written = setItemSpy.mock.calls.map(([, value]) => String(value));
    expect(written.some(item => item.includes('senha123'))).toBe(false);
    expect(window.localStorage.getItem('senha123')).toBeNull();
    expect(window.sessionStorage.getItem('senha123')).toBeNull();
    setItemSpy.mockRestore();
  });

  it('preserva o ?ref= da URL e envia como referralCode', async () => {
    referralGetMock.mockReturnValue('ABC123');
    registerMock.mockResolvedValue({ ok: true });
    renderWithProviders(<LoginPage mode="register" />, { route: '/cadastro?ref=abc123' });

    await waitFor(() => expect(referralSaveMock).toHaveBeenCalledWith('abc123'));

    await goToStep3(/barbearia/i);
    fillStep3();
    submitFinal();

    await waitFor(() => expect(registerMock).toHaveBeenCalledTimes(1));
    expect(registerMock.mock.calls[0][0].referralCode).toBe('ABC123');
  });

  it('foca o título da etapa ao avançar e marca o passo atual com aria-current', async () => {
    renderWithProviders(<LoginPage mode="register" />, { route: '/cadastro' });

    await fillStep1();
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Qual é o seu negócio?' })).toHaveFocus()
    );
    expect(screen.getByText('Segmento').closest('li')).toHaveAttribute('aria-current', 'step');
    expect(screen.getByText('Etapa 2 de 3')).toBeInTheDocument();
  });

  it('o botão do Google só existe na etapa 1', async () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-google-client-id');
    renderWithProviders(<LoginPage mode="register" />, { route: '/cadastro' });

    expect(screen.getByRole('button', { name: /cadastrar com google/i })).toBeInTheDocument();

    await goToStep2();
    expect(screen.queryByRole('button', { name: /cadastrar com google/i })).toBeNull();
  });

  it('erro de campo na etapa 3 leva o foco para o primeiro campo inválido', async () => {
    registerMock.mockResolvedValue({ ok: true });
    renderWithProviders(<LoginPage mode="register" />, { route: '/cadastro' });

    await goToStep3(/barbearia/i);
    // Nome e WhatsApp ok, cidade vazia (obrigatória).
    fireEvent.change(screen.getByPlaceholderText(/^nome /i), {
      target: { value: 'Barbearia Teste' },
    });
    fireEvent.change(screen.getByPlaceholderText('(11) 99999-9999'), {
      target: { value: '(11) 99999-9999' },
    });
    submitFinal();

    await waitFor(() => expect(screen.getByPlaceholderText('São Paulo')).toHaveFocus());
    expect(registerMock).not.toHaveBeenCalled();
  });

  it('a etapa 3 mostra o vocabulário do segmento escolhido', async () => {
    renderWithProviders(<LoginPage mode="register" />, { route: '/cadastro' });

    await goToStep3(/petshop/i);
    expect(screen.getByPlaceholderText('Nome do seu petshop')).toBeInTheDocument();
    expect(screen.getByText(/horários para petshops/i)).toBeInTheDocument();
  });

  it('CPF duplicado: erro inline no campo com link "Entrar agora?" e volta para a etapa 1', async () => {
    registerMock.mockResolvedValue({ ok: false, message: 'CPF já cadastrado' });
    renderWithProviders(<LoginPage mode="register" />, { route: '/cadastro' });

    await goToStep3(/barbearia/i);
    fillStep3();
    submitFinal();

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Comece pelo seu acesso' })).toBeInTheDocument()
    );
    expect(screen.getByText('Este CPF já está cadastrado.')).toBeInTheDocument();
    // O link do campo tem a interrogação; o atalho do topo ("Entrar agora") não.
    expect(screen.getByRole('button', { name: 'Entrar agora?' })).toBeInTheDocument();
  });

  it('check-cpf no blur: CPF ocupado mostra erro inline e o Continuar não avança', async () => {
    checkCpfMock.mockResolvedValue({ success: true, data: { available: false } });
    renderWithProviders(<LoginPage mode="register" />, { route: '/cadastro' });

    // Preenche a etapa 1 inteira, mas o CPF está ocupado no servidor.
    fireEvent.change(screen.getByPlaceholderText('João Silva'), {
      target: { value: 'João Silva' },
    });
    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), {
      target: { value: 'caio@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('000.000.000-00'), {
      target: { value: '52998224725' },
    });
    fireEvent.change(screen.getByPlaceholderText('Crie uma senha segura'), {
      target: { value: 'senha123' },
    });
    fireEvent.click(screen.getByLabelText(/li e aceito os termos de uso/i));
    fireEvent.click(screen.getByLabelText(/consinto com o tratamento dos meus dados/i));

    fireEvent.blur(screen.getByPlaceholderText('000.000.000-00'));
    await waitFor(() =>
      expect(screen.getByText('Este CPF já está cadastrado.')).toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole('button', { name: /^continuar$/i }));
    expect(checkCpfMock).toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Comece pelo seu acesso' })).toBeInTheDocument();
    expect(registerMock).not.toHaveBeenCalled();
  });
});
