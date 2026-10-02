import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import type { DaySchedule } from '../../types';
import { ClosedSalonJoinModal } from './ClosedSalonJoinModal';

const schedule: DaySchedule[] = [
  { dayName: 'Domingo', isOpen: false, openTime: '09:00', closeTime: '18:00' },
  { dayName: 'Segunda', isOpen: true, openTime: '09:00', closeTime: '19:00' },
  { dayName: 'Terça', isOpen: true, openTime: '09:00', closeTime: '19:00' },
  { dayName: 'Quarta', isOpen: true, openTime: '09:00', closeTime: '19:00' },
  { dayName: 'Quinta', isOpen: true, openTime: '09:00', closeTime: '20:00' },
  { dayName: 'Sexta', isOpen: true, openTime: '09:00', closeTime: '20:00' },
  { dayName: 'Sábado', isOpen: true, openTime: '08:30', closeTime: '17:00' },
];

const meta = {
  title: 'Fila/ClosedSalonJoinModal',
  component: ClosedSalonJoinModal,
  tags: ['autodocs', 'test'],
  parameters: { layout: 'centered' },
  args: {
    open: true,
    schedule,
    onAddAnyway: fn(),
    onOpenSettings: fn(),
    onClose: fn(),
  },
} satisfies Meta<typeof ClosedSalonJoinModal>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Submitting: Story = {
  args: { submitting: true },
};
