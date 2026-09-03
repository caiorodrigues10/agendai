import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { QueueItemCard } from './QueueItemCard';
import type { QueueItem, Service } from '../../types';

const item: QueueItem = {
  id: 'q1',
  customerName: 'Cliente da fila',
  whatsapp: '11999999999',
  serviceId: 's1',
  joinedAt: Date.now(),
  status: 'waiting',
};

const service: Service = {
  id: 's1',
  name: 'Corte',
  price: 40,
  avgTimeMinutes: 30,
  icon: 'scissors',
};

describe('QueueItemCard', () => {
  it('renderiza na fila pública sem SubscriptionProvider', () => {
    render(
      <QueueItemCard
        item={item}
        service={service}
        position={1}
        isAdmin={false}
        isCurrentUser
        shopName="Salão Teste"
        onStatusChange={vi.fn()}
        onLeaveQueue={vi.fn()}
      />
    );

    expect(screen.getByText('Cliente da fila')).toBeInTheDocument();
    expect(screen.queryByText(/produtos \(pagamento separado\)/i)).not.toBeInTheDocument();
  });
});
