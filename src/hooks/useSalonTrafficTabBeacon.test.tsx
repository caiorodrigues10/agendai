/// <reference types="vitest/globals" />
import React, { StrictMode, useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { sendSalonTrafficBeacon, type SalonTrafficTab } from '../infra/trafficBeaconApi';
import { useSalonTrafficTabBeacon } from './useSalonTrafficTabBeacon';

vi.mock('../infra/trafficBeaconApi', async importOriginal => {
  const actual = await importOriginal<typeof import('../infra/trafficBeaconApi')>();
  return {
    ...actual,
    sendSalonTrafficBeacon: vi.fn(),
  };
});

const sendBeacon = vi.mocked(sendSalonTrafficBeacon);

const pathname = '/queue/0f9d4a1c-6f6f-4d0e-9d1e-2b7a5c8e1f33';

interface HarnessProps {
  initialTab: SalonTrafficTab;
  route?: string;
}

const Harness: React.FC<HarnessProps> = ({ initialTab, route = pathname }) => {
  const [tab, setTab] = useState<SalonTrafficTab>(initialTab);
  useSalonTrafficTabBeacon({ pathname: route, tab });

  return (
    <div>
      <span data-testid="current-tab">{tab}</span>
      <button type="button" onClick={() => setTab('profile')}>
        profile
      </button>
      <button type="button" onClick={() => setTab('appointments')}>
        appointments
      </button>
    </div>
  );
};

describe('useSalonTrafficTabBeacon', () => {
  beforeEach(() => {
    sendBeacon.mockClear();
  });

  it('sends exactly one visit with the resolved initial tab, including under StrictMode', () => {
    render(
      <StrictMode>
        <Harness initialTab="queue" />
      </StrictMode>
    );

    expect(sendBeacon).toHaveBeenCalledTimes(1);
    expect(sendBeacon).toHaveBeenCalledWith({ pathname, tab: 'queue', kind: 'visit' });
  });

  it('reports a deep-linked initial tab as part of the visit', () => {
    render(
      <StrictMode>
        <Harness initialTab="profile" />
      </StrictMode>
    );

    // A página já resolveu o `?tab=profile`: a única visita carrega a aba.
    expect(sendBeacon).toHaveBeenCalledTimes(1);
    expect(sendBeacon).toHaveBeenCalledWith({ pathname, tab: 'profile', kind: 'visit' });
  });

  it('reports each later tab change as a tab view, never as a visit', () => {
    render(
      <StrictMode>
        <Harness initialTab="queue" />
      </StrictMode>
    );

    expect(sendBeacon).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'profile' }));
    expect(sendBeacon).toHaveBeenCalledTimes(2);
    expect(sendBeacon).toHaveBeenLastCalledWith({ pathname, tab: 'profile', kind: 'tab' });

    fireEvent.click(screen.getByRole('button', { name: 'appointments' }));
    expect(sendBeacon).toHaveBeenCalledTimes(3);
    expect(sendBeacon).toHaveBeenLastCalledWith({
      pathname,
      tab: 'appointments',
      kind: 'tab',
    });

    // Voltar para uma aba anterior é uma nova visualização de aba.
    fireEvent.click(screen.getByRole('button', { name: 'profile' }));
    expect(sendBeacon).toHaveBeenCalledTimes(4);
    expect(sendBeacon).toHaveBeenLastCalledWith({ pathname, tab: 'profile', kind: 'tab' });
  });

  it('never repeats a report when nothing observable changes', () => {
    render(
      <StrictMode>
        <Harness initialTab="queue" />
      </StrictMode>
    );

    expect(sendBeacon).toHaveBeenCalledTimes(1);

    // Re-render sem troca de `tab` (ex.: mudança só de query da rota) não
    // reenvia: o efeito só depende de pathname e tab.
    fireEvent.click(screen.getByRole('button', { name: 'profile' }));
    fireEvent.click(screen.getByRole('button', { name: 'profile' }));
    expect(sendBeacon).toHaveBeenCalledTimes(2);
  });

  it('sends a new visit when the reported pathname changes', () => {
    const { rerender } = render(
      <StrictMode>
        <Harness initialTab="queue" route="/queue/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" />
      </StrictMode>
    );

    expect(sendBeacon).toHaveBeenCalledTimes(1);
    expect(sendBeacon).toHaveBeenLastCalledWith({
      pathname: '/queue/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      tab: 'queue',
      kind: 'visit',
    });

    rerender(
      <StrictMode>
        <Harness initialTab="queue" route="/queue/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb" />
      </StrictMode>
    );

    expect(sendBeacon).toHaveBeenCalledTimes(2);
    expect(sendBeacon).toHaveBeenLastCalledWith({
      pathname: '/queue/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      tab: 'queue',
      kind: 'visit',
    });
  });
});
