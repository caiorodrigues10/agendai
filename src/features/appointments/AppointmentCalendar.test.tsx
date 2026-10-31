import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppointmentCalendar } from './AppointmentCalendar';
import { services, settings, staff } from './storyFixtures';
import { formatDateISO } from '../../utils/schedulingUtils';
import type { Appointment } from '../../types';

vi.mock('./AppointmentBookingModal', () => ({ AppointmentBookingModal: () => null }));

const appointment: Appointment = {
  id: 'appointment-test',
  customerName: 'Cliente de teste',
  whatsapp: '11999999999',
  serviceId: services[0].id,
  staffId: staff[0].id,
  date: formatDateISO(new Date()),
  time: '10:00',
  createdAt: Date.now(),
  status: 'confirmed',
};

it('preserves the appointment on failure and blocks duplicate confirmation while pending', async () => {
  const user = userEvent.setup();
  let finish: () => void = () => {};
  const cancel = vi
    .fn()
    .mockRejectedValueOnce(new Error('Falha ao cancelar'))
    .mockImplementationOnce(
      () =>
        new Promise<void>(resolve => {
          finish = resolve;
        })
    );
  render(
    <AppointmentCalendar
      appointments={[appointment]}
      services={services}
      staff={staff}
      settings={{ ...settings, schedule: settings.schedule.map(day => ({ ...day, isOpen: true })) }}
      occupancy={[]}
      onBook={vi.fn()}
      onCancel={cancel}
      onCheckIn={vi.fn()}
      onNoShow={vi.fn()}
    />
  );
  await user.click(screen.getAllByRole('button', { name: /Cliente de teste/ })[0]);
  await user.click(screen.getByRole('button', { name: 'Cancelar agendamento' }));
  await user.click(
    within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Cancelar agendamento' })
  );
  expect(await screen.findByText('Falha ao cancelar')).toBeVisible();
  expect(screen.getByRole('dialog', { name: 'Cliente de teste' })).toBeInTheDocument();
  await user.click(
    within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Cancelar agendamento' })
  );
  expect(screen.getByRole('button', { name: 'Aguarde…' })).toBeDisabled();
  await user.keyboard('{Escape}');
  expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  expect(cancel).toHaveBeenCalledTimes(2);
  await act(async () => finish());
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
