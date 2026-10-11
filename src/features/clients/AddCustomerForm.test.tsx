/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react';
import { AddCustomerForm } from './AddCustomerForm';
import type { Service } from '../../types';

const activeService: Service = {
  id: 'svc-active',
  name: 'Corte',
  price: 45,
  avgTimeMinutes: 30,
  icon: 'scissors',
  active: true,
};

const inactiveService: Service = {
  ...activeService,
  id: 'svc-inactive',
  name: 'Escova Antiga',
  active: false,
};

function renderForm(services: Service[]) {
  return render(
    <AddCustomerForm services={services} onJoin={vi.fn()} onCancel={vi.fn()} isStaffMode />
  );
}

describe('AddCustomerForm — serviços oferecidos na fila', () => {
  it('não oferece serviço inativo (o backend recusa com 400)', () => {
    renderForm([activeService, inactiveService]);

    expect(screen.getByText('Corte')).toBeInTheDocument();
    expect(screen.queryByText('Escova Antiga')).not.toBeInTheDocument();
  });

  it('mostra o aviso de vazio quando só há serviço inativo', () => {
    renderForm([inactiveService]);

    expect(screen.getByText(/nenhum serviço disponível/i)).toBeInTheDocument();
    expect(screen.queryByText('Escova Antiga')).not.toBeInTheDocument();
  });
});
