import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, type ReactNode } from 'react';
import { http, HttpResponse } from 'msw';
import { fireEvent, userEvent, within } from 'storybook/test';
import { UserFormDialog } from './UserFormDialog';
import { authStorage } from '../../infra/authStorage';
import type { BarbershopListItem } from '../../infra/adminApi';

const shops: BarbershopListItem[] = [
  {
    id: 'shop-1',
    name: 'Salão Central',
    cnpj: null,
    whatsapp: '11999990000',
    address: null,
    active: true,
    approvalStatus: 'APPROVED',
    createdAt: '2026-09-01T12:00:00.000Z',
    _count: { users: 1, appointments: 0, queue: 0 },
  },
  {
    id: 'shop-2',
    name: 'Espaço Navalha',
    cnpj: null,
    whatsapp: '11988887777',
    address: 'Av. Paulista, 1000',
    active: true,
    approvalStatus: 'APPROVED',
    createdAt: '2026-09-15T12:00:00.000Z',
    _count: { users: 3, appointments: 0, queue: 0 },
  },
];

const listOk = http.get('/api/admin/barbershops', () =>
  HttpResponse.json({
    success: true,
    data: shops,
    meta: { total: shops.length, page: 1, limit: 100, totalPages: 1 },
  })
);

const mswHandlers = [listOk];

/**
 * Semeia o access token (`adminApi.getAuthHeader()` lança "Não autenticado"
 * sem ele, antes mesmo do fetch) e limpa ao desmontar: o test-runner usa uma
 * única página/contexto, então o sessionStorage vaza entre stories sem este
 * cleanup.
 */
const StoryFrame = ({ children }: { children: ReactNode }) => {
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
  title: 'MasterAdmin/UserFormDialog',
  component: UserFormDialog,
  tags: ['autodocs', 'test'],
  args: {
    open: true,
    mode: 'create',
    user: null,
    selfUserId: 'self-1',
    onClose: () => undefined,
    onSaved: () => undefined,
  },
  decorators: [
    Story => {
      authStorage.setAccessToken('story-access-token', false);
      return (
        <StoryFrame>
          <Story />
        </StoryFrame>
      );
    },
  ],
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: mswHandlers },
  },
} satisfies Meta<typeof UserFormDialog>;
export default meta;
type Story = StoryObj<typeof meta>;

/** O `ModalShell` renderiza via portal em `document.body` (fora do canvas). */
const openDialog = async () => {
  const body = within(document.body);
  const dialog = await body.findByRole('dialog', {}, { timeout: 10000 });
  return within(dialog);
};

/**
 * Diálogo de criação aberto com os salões carregados
 * (GET /api/admin/barbershops?limit=100 → 200). Nenhum endpoint falha.
 */
export const Default: Story = {
  play: async () => {
    const dialog = await openDialog();
    await dialog.findByLabelText('Nome', {}, { timeout: 10000 });
    await dialog.findByText('Salão Central', {}, { timeout: 10000 });
  },
};

/**
 * Falha da criação: `POST /api/admin/users` responde 500 com
 * `{ success: false, message: 'Não foi possível criar o usuário.' }`. O play
 * preenche nome, e-mail e senha, envia o formulário e o banner
 * `<p role="alert">` (UserFormDialog.tsx:138) exibe a `message` do corpo dentro
 * do diálogo.
 */
export const ErroSalvar: Story = {
  parameters: {
    msw: {
      handlers: [
        ...mswHandlers,
        http.post('/api/admin/users', () =>
          HttpResponse.json(
            { success: false, message: 'Não foi possível criar o usuário.' },
            { status: 500 }
          )
        ),
      ],
    },
  },
  play: async () => {
    const dialog = await openDialog();
    await dialog.findByText('Salão Central', {}, { timeout: 10000 });
    fireEvent.change(await dialog.findByLabelText('Nome', {}, { timeout: 10000 }), {
      target: { value: 'Maria Silva' },
    });
    fireEvent.change(await dialog.findByLabelText('E-mail', {}, { timeout: 10000 }), {
      target: { value: 'maria@x.com' },
    });
    fireEvent.change(await dialog.findByLabelText(/^Senha/, {}, { timeout: 10000 }), {
      target: { value: '123456' },
    });
    await userEvent.click(
      await dialog.findByRole('button', { name: 'Criar usuário' }, { timeout: 10000 })
    );
    await dialog.findByText(/Não foi possível criar o usuário/, {}, { timeout: 10000 });
  },
};
