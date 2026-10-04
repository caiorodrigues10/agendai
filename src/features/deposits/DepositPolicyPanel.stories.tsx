import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { DepositPolicyPanel } from './DepositPolicyPanel';
import { StoryProviders } from '../../tests/storyProviders';

const json = (data: unknown) => HttpResponse.json({ success: true, data });

const policy = {
  depositRequired: 'MANDATORY',
  depositDefaultPercent: 30,
  depositDefaultAmount: 20,
  depositConfirmHours: 2,
  depositInstructions: 'Pix para (11) 99999-0000',
  depositPixKey: '11999990000',
  depositRefundRule: 'FULL_REFUND',
  noShowDepositRule: 'FORFEIT',
  maxReschedules: 2,
  rescheduleTransferDeposit: true,
  lateToleranceMinutes: 15,
  riskThresholdNoShows: 3,
  riskBlockDurationDays: 30,
  riskReinforcedDeposit: false,
  riskManualApproval: false,
};

const mswHandlers = (data: unknown) => [
  http.get('/api/barbershops/:id/deposit-policy', () => json(data)),
];

const meta = {
  title: 'Sinal/DepositPolicyPanel',
  component: DepositPolicyPanel,
  tags: ['autodocs', 'test'],
  decorators: [
    Story => (
      <StoryProviders>
        <Story />
      </StoryProviders>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: mswHandlers(policy) },
  },
} satisfies Meta<typeof DepositPolicyPanel>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
