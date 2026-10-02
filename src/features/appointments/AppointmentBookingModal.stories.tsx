import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { AppointmentBookingModal } from './AppointmentBookingModal';
import { services, settings, staff } from './storyFixtures';

const meta = {
  title: 'Agenda/AppointmentBookingModal',
  component: AppointmentBookingModal,
  tags: ['autodocs', 'test'],
  parameters: { layout: 'centered' },
  args: {
    services,
    staff,
    settings,
    occupancy: [],
    onBook: fn(),
    onClose: fn(),
  },
} satisfies Meta<typeof AppointmentBookingModal>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const PreselectedClient: Story = {
  args: {
    defaultClient: { id: 'cli-1', name: 'Maria Silva', whatsapp: '5511999990000' },
    defaultDate: '2026-10-05',
    defaultTime: '10:00',
    defaultStaffId: 'st-1',
  },
};

export const WithOccupancy: Story = {
  args: {
    occupancy: [
      { time: '10:00', staffId: 'st-1', durationMinutes: 50 },
      { time: '14:00', staffId: 'st-2', durationMinutes: 30 },
    ],
  },
};
