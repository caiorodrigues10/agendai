import { fireEvent, render, screen } from '@testing-library/react';
import { ClientPortalLogin } from './ClientPortalLogin';
import { clientPortalApi } from '../../infra/clientPortalApi';

vi.mock('../../infra/clientPortalApi', () => ({
  clientPortalApi: { requestCode: vi.fn(), verifyCode: vi.fn() },
}));
it('uses labelled inputs and native form submission for both OTP steps', async () => {
  vi.mocked(clientPortalApi.requestCode).mockResolvedValue({ success: true });
  vi.mocked(clientPortalApi.verifyCode).mockResolvedValue({ accessToken: 'fixture' });
  const authenticated = vi.fn();
  render(<ClientPortalLogin onAuthenticated={authenticated} />);
  fireEvent.change(screen.getByLabelText('Telefone (WhatsApp)'), {
    target: { value: '11999990000' },
  });
  fireEvent.submit(screen.getByLabelText('Telefone (WhatsApp)').closest('form')!);
  const otp = await screen.findByLabelText('Código de 6 dígitos');
  expect(otp).toHaveAttribute('autocomplete', 'one-time-code');
  fireEvent.change(otp, { target: { value: '123456' } });
  fireEvent.submit(otp.closest('form')!);
  await vi.waitFor(() => expect(authenticated).toHaveBeenCalledOnce());
  expect(clientPortalApi.verifyCode).toHaveBeenCalledWith('11999990000', '123456');
});
