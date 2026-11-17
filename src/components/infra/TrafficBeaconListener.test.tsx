/// <reference types="vitest/globals" />
import React, { StrictMode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { sendTrafficBeacon } from '../../infra/trafficBeaconApi';
import { TrafficBeaconListener } from './TrafficBeaconListener';

vi.mock('../../infra/trafficBeaconApi', () => ({
  sendTrafficBeacon: vi.fn(),
}));

const sendBeacon = vi.mocked(sendTrafficBeacon);

const NavigateToAnotherPath = () => {
  const navigate = useNavigate();
  return <button onClick={() => navigate('/s/another')}>navigate</button>;
};

const NavigateBackToFirstPath = () => {
  const navigate = useNavigate();
  return <button onClick={() => navigate('/s/example')}>navigate back</button>;
};

const ChangeQueryOnly = () => {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate('/s/salon/0f9d4a1c-6f6f-4d0e-9d1e-2b7a5c8e1f33?tab=profile&utm_source=ads')}>
      change query
    </button>
  );
};

const NavigateToSelfReportedPage = () => {
  const navigate = useNavigate();
  return <button onClick={() => navigate('/queue/abc-123')}>open queue page</button>;
};

describe('TrafficBeaconListener', () => {
  beforeEach(() => {
    sendBeacon.mockClear();
  });

  it('sends once for the initial pathname, including under StrictMode', () => {
    render(
      <StrictMode>
        <MemoryRouter initialEntries={['/s/example']}>
          <TrafficBeaconListener />
        </MemoryRouter>
      </StrictMode>
    );

    expect(sendBeacon).toHaveBeenCalledTimes(1);
    expect(sendBeacon).toHaveBeenCalledWith({ pathname: '/s/example', search: '' });
  });

  it('sends when the pathname changes', () => {
    render(
      <MemoryRouter initialEntries={['/s/example']}>
        <TrafficBeaconListener />
        <NavigateToAnotherPath />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'navigate' }));

    expect(sendBeacon).toHaveBeenCalledTimes(2);
    expect(sendBeacon).toHaveBeenLastCalledWith({ pathname: '/s/another', search: '' });
  });

  it('passes the query string of a public salon deep link', () => {
    render(
      <MemoryRouter initialEntries={['/s/salon/0f9d4a1c-6f6f-4d0e-9d1e-2b7a5c8e1f33?tab=profile']}>
        <TrafficBeaconListener />
      </MemoryRouter>
    );

    expect(sendBeacon).toHaveBeenCalledTimes(1);
    expect(sendBeacon).toHaveBeenCalledWith({
      pathname: '/s/salon/0f9d4a1c-6f6f-4d0e-9d1e-2b7a5c8e1f33',
      search: '?tab=profile',
    });
  });

  it('does not send for /queue/:id — the page reports its own visit', () => {
    render(
      <StrictMode>
        <MemoryRouter initialEntries={['/queue/abc-123?tab=profile']}>
          <TrafficBeaconListener />
          <NavigateToSelfReportedPage />
        </MemoryRouter>
      </StrictMode>
    );

    // A rota auto-reportada (`useSalonTrafficTabBeacon`) não passa pelo
    // listener: uma entrada na página gera exatamente 1 ping `visit`.
    expect(sendBeacon).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'open queue page' }));
    expect(sendBeacon).not.toHaveBeenCalled();
  });

  it('does not resend when only the query string changes for the same pathname', () => {
    render(
      <MemoryRouter initialEntries={['/s/salon/0f9d4a1c-6f6f-4d0e-9d1e-2b7a5c8e1f33?tab=queue']}>
        <TrafficBeaconListener />
        <ChangeQueryOnly />
      </MemoryRouter>
    );

    expect(sendBeacon).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'change query' }));

    // A deduplicação continua por pathname: a troca de query não gera uma
    // nova visita (a visualização de aba é reportada pelo hook da página).
    expect(sendBeacon).toHaveBeenCalledTimes(1);
  });

  it('sends again after navigating back to a previously visited pathname', () => {
    render(
      <MemoryRouter initialEntries={['/s/example']}>
        <TrafficBeaconListener />
        <NavigateToAnotherPath />
        <NavigateBackToFirstPath />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'navigate' }));
    fireEvent.click(screen.getByRole('button', { name: 'navigate back' }));

    expect(sendBeacon).toHaveBeenCalledTimes(3);
    expect(sendBeacon).toHaveBeenLastCalledWith({ pathname: '/s/example', search: '' });
  });
});
