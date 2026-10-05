import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { userEvent, within } from 'storybook/test';
import { OwnerNotificationsPanel } from './OwnerNotificationsPanel';
import type { NotificationPreference } from '../../infra/notificationsApi';

const preferences: NotificationPreference[] = [
  {
    channel: 'WHATSAPP',
    type: 'APPOINTMENT_CONFIRMATION',
    enabled: true,
    label: 'Confirmação de agendamento',
    description: 'Cliente confirma ou remarca pelo aviso.',
  },
  {
    channel: 'WHATSAPP',
    type: 'QUEUE_JOINED',
    enabled: false,
    label: 'Entrada na fila',
  },
  {
    channel: 'EMAIL',
    type: 'APPOINTMENT_REMINDER',
    enabled: true,
    label: 'Lembrete de agendamento',
  },
];

const json = (data: unknown) => HttpResponse.json({ success: true, data });

const mswHandlers = [
  http.get('/api/notifications/preferences', () => json(preferences)),
];

const meta = {
  title: 'Notificações/OwnerNotificationsPanel',
  component: OwnerNotificationsPanel,
  tags: ['autodocs', 'test'],
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: mswHandlers },
  },
} satisfies Meta<typeof OwnerNotificationsPanel>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Espera as preferências carregadas antes do capture. */
const waitForPreferences = async (body: ReturnType<typeof within>) => {
  await body.findByText('Confirmação de agendamento', {}, { timeout: 10000 });
};

export const Default: Story = {
  play: async () => {
    await waitForPreferences(within(document.body));
  },
};

/** Falha do load (GET preferences → 500): card de erro com retry. */
export const Erro: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/notifications/preferences', () =>
          HttpResponse.json(
            { success: false, message: 'Não foi possível carregar as preferências.' },
            { status: 500 }
          )
        ),
      ],
    },
  },
  play: async () => {
    await within(document.body).findByText(
      'Não foi possível carregar as preferências.',
      {},
      { timeout: 10000 }
    );
  },
};

/** Falha da submissão (PATCH preferences → 500): banner inline após "Salvar preferências". */
export const ErroSalvar: Story = {
  parameters: {
    msw: {
      handlers: [
        ...mswHandlers,
        http.patch('/api/notifications/preferences', () =>
          HttpResponse.json(
            { success: false, message: 'Não foi possível salvar as preferências.' },
            { status: 500 }
          )
        ),
      ],
    },
  },
  play: async () => {
    const body = within(document.body);
    await waitForPreferences(body);
    await userEvent.click(
      await body.findByRole(
        'switch',
        { name: 'Confirmação de agendamento por WhatsApp' },
        { timeout: 10000 }
      )
    );
    await userEvent.click(
      await body.findByRole('button', { name: 'Salvar preferências' }, { timeout: 10000 })
    );
    await body.findByText('Não foi possível salvar as preferências.', {}, { timeout: 10000 });
  },
};
