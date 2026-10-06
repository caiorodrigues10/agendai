import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useEffect } from 'react';
import { http, HttpResponse } from 'msw';
import { expect, userEvent, within } from 'storybook/test';
import { CategoryManager } from './CategoryManager';
import { useCategories } from '../../hooks/useCategories';
import { StoryProviders } from '../../tests/storyProviders';
import { authStorage } from '../../infra/authStorage';
import { serviceCategoriesApi, type Category } from '../../infra/categoriesApi';
import type { StaffMember } from '../../types';

const json = (data: unknown) => HttpResponse.json({ success: true, data });

const storyUser: StaffMember = {
  id: 'usr-1',
  name: 'Caio',
  email: 'caio@agendaja.com.br',
  role: 'OWNER',
  barbershopId: 'shop-1',
  emailVerified: true,
};

const categories: Category[] = [
  {
    id: 'cat-1',
    barbershopId: 'shop-1',
    name: 'Cabelo',
    color: '#123456',
    description: null,
    icon: null,
    active: true,
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'cat-2',
    barbershopId: 'shop-1',
    name: 'Barba',
    color: null,
    description: null,
    icon: null,
    active: true,
    createdAt: '2026-09-02T10:00:00.000Z',
    updatedAt: '2026-09-02T10:00:00.000Z',
  },
];

/** Boot do `AuthProvider` (token semeado no decorator). */
const authMe = http.get('/api/auth/me', () => HttpResponse.json({ user: storyUser }));

/** `GET /api/service-categories` (useCategories('service')) → lista carregada. */
const listOk = http.get('/api/service-categories', () => json(categories));

/** `GET /api/service-categories` → 500: alimenta `state.error` (CategoryManager L68). */
const listFail = http.get('/api/service-categories', () =>
  HttpResponse.json(
    { success: false, message: 'Não foi possível carregar as categorias.' },
    { status: 500 }
  )
);

/** `POST /api/service-categories` → 500: alimenta o `error` local (L80). */
const createFail = http.post('/api/service-categories', () =>
  HttpResponse.json(
    { success: false, message: 'Não foi possível criar a categoria.' },
    { status: 500 }
  )
);

const mswHandlers = () => [authMe, listOk];

/**
 * Fixture do retorno de `useCategories('service')`: só documenta o contrato do
 * hook no autodocs — a story renderiza o harness real (que roda o hook de novo).
 */
const storyState: ReturnType<typeof useCategories> = {
  categories,
  loading: false,
  error: null,
  reload: async () => undefined,
  api: serviceCategoriesApi,
  barbershopId: 'shop-1',
  canCreate: true,
  canEdit: () => true,
  changed: () => undefined,
};

/**
 * O `state` vem do hook `useCategories('service')` (mesmo wiring do
 * `ServiceManager` L28/L45), então a story renderiza um harness — os args
 * documentam a API pública do componente no autodocs.
 */
const CategoryHarness: React.FC = () => {
  const state = useCategories('service');
  return (
    <CategoryManager
      title="Categorias de serviços"
      linkedLabel="Os serviços vinculados"
      state={state}
      onChanged={() => undefined}
    />
  );
};

/**
 * Semeia token/usuário em `sessionStorage` antes do `AuthProvider` montar e limpa
 * tudo ao desmontar: o test-runner usa um único contexto do Playwright, então o
 * storage vaza entre stories sem este cleanup (mesmo padrão de TeamManager).
 */
const StoryFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(
    () => () => {
      authStorage.clearTokens();
      authStorage.clearUser();
    },
    []
  );
  return <>{children}</>;
};

const meta = {
  title: 'Catálogo/CategoryManager',
  component: CategoryManager,
  tags: ['autodocs', 'test'],
  render: () => <CategoryHarness />,
  args: {
    title: 'Categorias de serviços',
    linkedLabel: 'Os serviços vinculados',
    state: storyState,
    onChanged: () => undefined,
  },
  decorators: [
    Story => {
      authStorage.setAccessToken('story-access-token', false);
      authStorage.setUser(storyUser, false);
      return (
        <StoryFrame>
          <StoryProviders withAuth>
            <Story />
          </StoryProviders>
        </StoryFrame>
      );
    },
  ],
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: mswHandlers() },
  },
} satisfies Meta<typeof CategoryManager>;
export default meta;
type Story = StoryObj<typeof meta>;

const expand = async (canvas: ReturnType<typeof within>) => {
  await userEvent.click(
    await canvas.findByRole('button', { name: /Categorias de serviços/ }, { timeout: 10000 })
  );
};

/**
 * Categorias carregadas (GET /api/service-categories → success/data) com o painel
 * expandido: lista de categorias e o botão "Nova categoria" visíveis.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expand(canvas);
    await canvas.findByText('Cabelo', {}, { timeout: 10000 });
    await canvas.findByText('Barba', {}, { timeout: 10000 });
    await canvas.findByRole('button', { name: /Nova categoria/ }, { timeout: 10000 });
  },
};

/**
 * Falha do load (GET /api/service-categories → 500): banner `role="alert"` com a
 * mensagem de erro e o botão "Tentar novamente" dentro do painel expandido
 * (CategoryManager L68-69) — estado final do play.
 */
export const Erro: Story = {
  // O MSW casa o PRIMEIRO handler do array: o 500 precisa vir antes do `listOk`.
  parameters: { msw: { handlers: [authMe, listFail] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expand(canvas);
    const alert = await canvas.findByRole('alert', {}, { timeout: 10000 });
    expect(alert).toHaveTextContent(/Não foi possível carregar as categorias/);
    await canvas.findByRole('button', { name: 'Tentar novamente' }, { timeout: 10000 });
  },
};

/**
 * Falha da criação (POST /api/service-categories → 500): formulário "Nova
 * categoria" aberto com o banner `role="alert"` logo abaixo da lista
 * (CategoryManager L80) — o GET continua com sucesso.
 */
export const ErroSalvar: Story = {
  parameters: { msw: { handlers: [...mswHandlers(), createFail] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expand(canvas);
    await canvas.findByText('Cabelo', {}, { timeout: 10000 });
    await userEvent.click(
      await canvas.findByRole('button', { name: /Nova categoria/ }, { timeout: 10000 })
    );
    await userEvent.type(
      await canvas.findByLabelText('Nome da categoria', {}, { timeout: 10000 }),
      'Unhas'
    );
    await userEvent.click(
      await canvas.findByRole('button', { name: /Salvar categoria/ }, { timeout: 10000 })
    );
    const alert = await canvas.findByRole('alert', {}, { timeout: 10000 });
    expect(alert).toHaveTextContent(/Não foi possível criar a categoria/);
  },
};
