import type { Meta, StoryObj } from '@storybook/react-vite';
import { PublicLinkPanel } from './PublicLinkPanel';

const meta = {
  title: 'Divulgação/Links públicos',
  component: PublicLinkPanel,
  args: { barbershopId: '11111111-1111-4111-8111-111111111111', operationMode: 'HYBRID' },
} satisfies Meta<typeof PublicLinkPanel>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
