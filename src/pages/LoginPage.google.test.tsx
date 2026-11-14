/// <reference types="vitest/globals" />
/**
 * Auditoria Google Auth — LoginPage (não altera produção).
 *
 * Cobre o item 1b/2f da verificação:
 * - sem VITE_GOOGLE_CLIENT_ID o botão some em silêncio (sem erro no console/UI);
 * - com Client ID o botão aparece no login e na etapa 1 do cadastro;
 * - clique injeta o GIS; falha de carga vira mensagem de erro (retry possível);
 * - prompt não exibido → mensagem de erro (não é clique "mudo");
 * - callback do GIS chama loginWithGoogle e a falha vira mensagem visível;
 * - o GIS é inicializado uma única vez por montagem;
 * - no cadastro o callback preenche/trava o e-mail (authMethod=google).
 *
 * Ordem importa: `gsiPromise` é estado de módulo do LoginPage. Os testes que
 * injetam o script rodam antes dos que já partem com `window.google` pronto.
 */
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { LoginPage } from './LoginPage';
import { renderWithProviders } from '../tests/testUtils';

const loginMock = vi.fn();
const registerMock = vi.fn();
const registerWithGoogleMock = vi.fn();
const loginWithGoogleMock = vi.fn();
const loginWithSavedAccountMock = vi.fn();
const forgetSavedAccountMock = vi.fn();
const navigateMock = vi.fn();
const subscriptionsMeMock = vi.hoisted(() => vi.fn());

const GOOGLE_CLIENT_ID = 'test-client-id';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    login: loginMock,
    loginWithGoogle: loginWithGoogleMock,
    loginWithSavedAccount: loginWithSavedAccountMock,
    forgetSavedAccount: forgetSavedAccountMock,
    register: registerMock,
    registerWithGoogle: registerWithGoogleMock,
    logout: vi.fn(),
    hasRole: () => false,
  }),
}));

vi.mock('../utils/referralStorage', () => ({
  referralStorage: { get: () => null, set: vi.fn(), clear: vi.fn() },
}));

vi.mock('../infra/authStorage', () => ({
  authStorage: {
    getSavedAccounts: () => [],
    hasStoredSession: () => false,
    getUser: () => null,
    getAccessToken: () => 'token-123',
  },
}));

vi.mock('../infra/authApi', () => ({
  authApi: {
    checkCpf: vi.fn().mockResolvedValue({ success: true, data: { available: true } }),
    resendVerification: vi.fn().mockResolvedValue({ success: true, message: 'ok' }),
  },
}));

vi.mock('../infra/subscriptionsApi', () => ({
  subscriptionsApi: { me: subscriptionsMeMock },
}));

interface GisInitOptions {
  client_id?: string;
  callback?: (resp: { credential?: string }) => void;
}

function gisScripts(): HTMLScriptElement[] {
  return [...document.querySelectorAll<HTMLScriptElement>('script[src*="accounts.google.com"]')];
}

function removeGisScripts() {
  gisScripts().forEach(s => s.remove());
}

/** Instala um GIS falso no window (initialize/prompt controlados pelo teste). */
function installFakeGis() {
  const initialize = vi.fn();
  const prompt = vi.fn();
  (window as unknown as { google?: unknown }).google = {
    accounts: { id: { initialize, prompt } },
  };
  return { initialize, prompt };
}

function lastInitOptions(): GisInitOptions {
  const { initialize } = (window as unknown as { google: { accounts: { id: { initialize: ReturnType<typeof vi.fn> } } } })
    .google.accounts.id;
  expect(initialize).toHaveBeenCalled();
  return initialize.mock.calls[initialize.mock.calls.length - 1][0] as GisInitOptions;
}

function makeCredential(payload: Record<string, unknown>) {
  return ['header', btoa(JSON.stringify(payload)), 'signature'].join('.');
}

async function clickGoogleButton(name: RegExp) {
  fireEvent.click(screen.getByRole('button', { name }));
  await waitFor(() => expect(gisScripts().length).toBeGreaterThan(0));
  return gisScripts()[gisScripts().length - 1];
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  removeGisScripts();
  delete (window as { google?: unknown }).google;
  vi.stubEnv('VITE_GOOGLE_CLIENT_ID', GOOGLE_CLIENT_ID);
  loginWithGoogleMock.mockResolvedValue({ ok: true });
  registerWithGoogleMock.mockResolvedValue({ ok: true });
  registerMock.mockResolvedValue({ ok: true });
  loginMock.mockResolvedValue({ ok: true });
  subscriptionsMeMock.mockRejectedValue(new Error('offline'));
});

afterEach(() => {
  removeGisScripts();
  delete (window as { google?: unknown }).google;
  vi.unstubAllEnvs();
});

describe('LoginPage — botão Google (item 1b/2f)', () => {
  it('sem VITE_GOOGLE_CLIENT_ID o botão some em silêncio no login e no cadastro', () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', '');

    const { unmount } = renderWithProviders(<LoginPage />, { route: '/login' });
    expect(screen.queryByRole('button', { name: /entrar com google/i })).toBeNull();
    expect(screen.queryByText(/não foi possível/i)).toBeNull();
    unmount();

    renderWithProviders(<LoginPage mode="register" />, { route: '/cadastro' });
    expect(screen.queryByRole('button', { name: /cadastrar com google/i })).toBeNull();
  });

  it('com Client ID os dois botões aparecem', () => {
    const { unmount } = renderWithProviders(<LoginPage />, { route: '/login' });
    expect(screen.getByRole('button', { name: /entrar com google/i })).toBeInTheDocument();
    unmount();

    renderWithProviders(<LoginPage mode="register" />, { route: '/cadastro' });
    expect(screen.getByRole('button', { name: /cadastrar com google/i })).toBeInTheDocument();
  });

  it('o script do GIS só é injetado na interação, nunca no mount', () => {
    renderWithProviders(<LoginPage />, { route: '/login' });
    expect(gisScripts()).toHaveLength(0);
  });
});

describe('LoginPage — carregamento do GIS', () => {
  it('clique injeta o script e a falha de carga vira mensagem de erro', async () => {
    renderWithProviders(<LoginPage />, { route: '/login' });

    const script = await clickGoogleButton(/entrar com google/i);

    script.onerror?.(new Event('error'));

    await waitFor(() =>
      expect(screen.getByText('Falha ao carregar script do Google.')).toBeInTheDocument()
    );
    expect(loginWithGoogleMock).not.toHaveBeenCalled();
  });

  it('GIS carregado: initialize usa o client_id e o callback chama loginWithGoogle', async () => {
    renderWithProviders(<LoginPage />, { route: '/login' });

    const script = await clickGoogleButton(/entrar com google/i);
    const { initialize } = installFakeGis();
    script.onload?.(new Event('load'));

    await waitFor(() => expect(initialize).toHaveBeenCalledTimes(1));
    expect(lastInitOptions().client_id).toBe(GOOGLE_CLIENT_ID);

    lastInitOptions().callback?.({ credential: 'fake-google-credential' });
    await waitFor(() => expect(loginWithGoogleMock).toHaveBeenCalledWith('fake-google-credential'));
  });
});

describe('LoginPage — prompt e erros do login Google', () => {
  it('prompt não exibido mostra mensagem de erro (clique não fica mudo)', async () => {
    const { prompt } = installFakeGis();
    prompt.mockImplementation(cb => cb({ isNotDisplayed: () => true, isSkippedMoment: () => false }));
    renderWithProviders(<LoginPage />, { route: '/login' });

    fireEvent.click(screen.getByRole('button', { name: /entrar com google/i }));

    await waitFor(() =>
      expect(screen.getByText('Não foi possível continuar com o Google. Tente novamente.')).toBeInTheDocument()
    );
  });

  it('falha do loginWithGoogle exibe a mensagem devolvida pelo AuthContext', async () => {
    const { initialize, prompt } = installFakeGis();
    prompt.mockImplementation(cb => cb({ isNotDisplayed: () => false, isSkippedMoment: () => false }));
    loginWithGoogleMock.mockResolvedValue({
      ok: false,
      message: 'Conta não encontrada. Cadastre-se normalmente com e-mail e senha.',
    });
    renderWithProviders(<LoginPage />, { route: '/login' });

    fireEvent.click(screen.getByRole('button', { name: /entrar com google/i }));

    await waitFor(() => expect(initialize).toHaveBeenCalled());
    const { callback } = lastInitOptions();
    callback?.({ credential: 'fake-google-credential' });

    await waitFor(() =>
      expect(
        screen.getByText('Conta não encontrada. Cadastre-se normalmente com e-mail e senha.')
      ).toBeInTheDocument()
    );
    expect(loginWithGoogleMock).toHaveBeenCalledTimes(1);
  });

  it('sem google.accounts.id no window a mensagem de erro é explícita', async () => {
    // Estado anômalo: a promessa do script já resolveu mas a API não está no
    // window (rede/firewall). O clique antigo falhava em silêncio.
    renderWithProviders(<LoginPage />, { route: '/login' });

    fireEvent.click(screen.getByRole('button', { name: /entrar com google/i }));

    await waitFor(() =>
      expect(screen.getByText('Não foi possível carregar o Google. Tente novamente.')).toBeInTheDocument()
    );
    expect(loginWithGoogleMock).not.toHaveBeenCalled();
  });

  it('não inicializa o GIS duas vezes na mesma montagem', async () => {
    const { initialize } = installFakeGis();
    renderWithProviders(<LoginPage />, { route: '/login' });

    fireEvent.click(screen.getByRole('button', { name: /entrar com google/i }));
    fireEvent.click(screen.getByRole('button', { name: /entrar com google/i }));

    await waitFor(() => expect(initialize).toHaveBeenCalledTimes(1));
  });
});

describe('LoginPage — cadastro com Google', () => {
  it('callback no cadastro preenche o e-mail e entra no modo Google', async () => {
    const { initialize, prompt } = installFakeGis();
    prompt.mockImplementation(cb => cb({ isNotDisplayed: () => false, isSkippedMoment: () => false }));
    renderWithProviders(<LoginPage mode="register" />, { route: '/cadastro' });

    fireEvent.click(screen.getByRole('button', { name: /cadastrar com google/i }));

    await waitFor(() => expect(initialize).toHaveBeenCalled());
    const { callback } = lastInitOptions();
    callback?.({ credential: makeCredential({ email: 'dono@salao.com', name: 'Dono Teste' }) });

    await waitFor(() =>
      expect(screen.getByPlaceholderText('seu@email.com')).toHaveValue('dono@salao.com')
    );
    // Modo Google: o e-mail fica travado e aparece o atalho de voltar à senha.
    expect(screen.getByRole('button', { name: /usar e-mail e senha/i })).toBeInTheDocument();
    expect(registerWithGoogleMock).not.toHaveBeenCalled();
  });
});
