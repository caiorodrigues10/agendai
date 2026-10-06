import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { within } from 'storybook/test';
import PublicAppointmentManagePage from './PublicAppointmentManagePage';

const json = (data: unknown) => HttpResponse.json({ success: true, data });

const appointment = {
  id: 'apt-1',
  barbershopId: 'shop-1',
  serviceId: 'svc-1',
  staffId: 'staff-1',
  customerName: 'Ana Souza',
  date: '2026-10-05T14:00:00.000Z',
  time: '14:00',
  status: 'CONFIRMED',
  service: { name: 'Corte + Barba', avgTimeMinutes: 45 },
  staff: { name: 'Rafael' },
  barbershop: {
    name: 'Barbearia Central',
    address: 'Rua das Flores, 100',
    city: 'São Paulo',
  },
};

/** Troca do token público pela sessão de gerenciamento (L23 do componente). */
const sessionHandler = http.post('/api/appointments/public/session', () =>
  json({ appointment, sessionToken: 'session-1' })
);

const slotsHandler = http.get('/api/appointments/slots', () =>
  json([
    { time: '14:30', staffId: 'staff-1', durationMinutes: 45 },
    { time: '15:15', staffId: 'staff-1', durationMinutes: 45 },
  ])
);

const mswHandlers = [sessionHandler, slotsHandler];

/**
 * A página lê o token direto de `window.location.hash` no mount, então o
 * loader garante um hash determinístico antes do primeiro render.
 */
const seedHash = async (hash: string): Promise<Record<string, unknown>> => {
  window.location.hash = hash;
  return {};
};

const withManageTokenHash = () => seedHash('#token=manage-token-demo');
const withoutManageTokenHash = () => seedHash('');

const meta = {
  title: 'Públicas/PublicAppointmentManagePage',
  component: PublicAppointmentManagePage,
  tags: ['autodocs', 'test'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PublicAppointmentManagePage>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Link sem `#token=`: o efeito de mount seta `error` com a mensagem padrão e
 * desliga o loading, então o shell da página monta com o banner vermelho ao
 * lado do cabeçalho — nenhuma chamada de API acontece (nenhum handler MSW).
 */
export const Erro: Story = {
  loaders: [withoutManageTokenHash],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText(
      /Link de gerenciamento ausente ou inválido/,
      {},
      { timeout: 10000 }
    );
  },
};

/**
 * Link válido: `POST /api/appointments/public/session` devolve o agendamento e
 * a sessão; `GET /api/appointments/slots` devolve os horários da data do
 * agendamento (status CONFIRMED → card de dados + remarcar/cancelar).
 */
export const Default: Story = {
  loaders: [withManageTokenHash],
  parameters: {
    msw: { handlers: mswHandlers },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Gerenciar agendamento', {}, { timeout: 10000 });
    await canvas.findByText('Barbearia Central', {}, { timeout: 10000 });
    await canvas.findByText('Cliente: Ana Souza', {}, { timeout: 10000 });
    await canvas.findByRole('button', { name: '14:30' }, { timeout: 10000 });
  },
};
