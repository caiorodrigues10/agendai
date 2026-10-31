import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { fn } from 'storybook/test';
import { ClientPortalLogin } from './ClientPortalLogin';

const meta = {
  title: 'Cliente/Acesso',
  component: ClientPortalLogin,
  tags: ['test'],
  args: { onAuthenticated: fn() },
  decorators: [
    Story => (
      <main className="px-4">
        <Story />
      </main>
    ),
  ],
  parameters: {
    msw: {
      handlers: [
        http.post('/api/client/portal/request-otp', () => HttpResponse.json({ success: true })),
        http.post('/api/client/portal/verify-otp', () =>
          HttpResponse.json({ success: true, data: { identity: { name: 'Ana' } } })
        ),
      ],
    },
  },
} satisfies Meta<typeof ClientPortalLogin>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Telefone: Story = {};
