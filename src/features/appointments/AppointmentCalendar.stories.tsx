import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { AppointmentCalendar } from './AppointmentCalendar';
import { services, settings, staff } from './storyFixtures';
import { formatDateISO } from '../../utils/schedulingUtils';

const meta = {
  title: 'Agenda/Calendário do salão',
  component: AppointmentCalendar,
  args: {
    services,
    staff,
    settings: { ...settings, schedule: settings.schedule.map(day => ({ ...day, isOpen: true })) },
    appointments: [
      {
        id: 'appointment-fixture',
        customerName: 'Cliente de demonstração',
        whatsapp: '11999999999',
        serviceId: services[0].id,
        staffId: staff[0].id,
        date: formatDateISO(new Date()),
        time: '10:00',
        createdAt: Date.now(),
        status: 'confirmed',
      },
    ],
    occupancy: [],
    onBook: fn(),
    onCancel: fn(),
    onCheckIn: fn(),
    onNoShow: fn(),
  },
} satisfies Meta<typeof AppointmentCalendar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
