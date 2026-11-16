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
    expect(sendBeacon).toHaveBeenCalledWith({ pathname: '/s/example' });
  });

  it('sends again only when the pathname changes', () => {
    render(
      <MemoryRouter initialEntries={['/s/example']}>
        <TrafficBeaconListener />
        <NavigateToAnotherPath />
      </MemoryRouter>
    );

    expect(sendBeacon).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'navigate' }));

    expect(sendBeacon).toHaveBeenCalledTimes(2);
    expect(sendBeacon).toHaveBeenLastCalledWith({ pathname: '/s/another' });
  });
});
