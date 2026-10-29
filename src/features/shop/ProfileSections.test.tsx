/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react';
import { ProfileAbout } from './ProfileSections';
import type { Service, ShopSettings } from '../../types';

function settings(patch: Partial<ShopSettings> = {}): ShopSettings {
  return {
    shopName: 'Escritório Teste',
    whatsapp: '11999999999',
    schedule: [],
    businessSegment: 'LAW_FIRM',
    ...patch,
  };
}

function service(patch: Partial<Service> = {}): Service {
  return {
    id: 'svc-1',
    barbershopId: 'shop-1',
    name: 'Consulta inicial',
    price: 350,
    avgTimeMinutes: 60,
    icon: 'user',
    active: true,
    ...patch,
  } as Service;
}

describe('ProfileAbout', () => {
  it('não divulga preços no perfil público de segmento restrito', () => {
    render(<ProfileAbout settings={settings()} services={[service()]} />);
    expect(screen.getByText('Consulta inicial')).toBeInTheDocument();
    expect(screen.queryByText(/R\$\s*350/)).toBeNull();
  });

  it('mostra o preço no perfil público de segmento sem restrição', () => {
    render(
      <ProfileAbout
        settings={settings({ businessSegment: 'BARBERSHOP' })}
        services={[service({ name: 'Corte', price: 60 })]}
      />
    );
    expect(screen.getByText(/R\$\s*60/)).toBeInTheDocument();
  });

  it('lista apenas os serviços agendáveis pelo público', () => {
    render(
      <ProfileAbout
        settings={settings()}
        services={[service(), service({ id: 'svc-2', name: 'Audiência interna', publicBookable: false })]}
      />
    );
    expect(screen.getByText('Consulta inicial')).toBeInTheDocument();
    expect(screen.queryByText('Audiência interna')).toBeNull();
  });

  it('mostra registro da OAB e áreas de atuação', () => {
    render(
      <ProfileAbout
        settings={settings({ oabRegistration: 'SP 123456', practiceAreas: ['Trabalhista'] })}
        services={[service()]}
      />
    );
    expect(screen.getByText('OAB/SP nº 123456')).toBeInTheDocument();
    expect(screen.getByText('Trabalhista')).toBeInTheDocument();
  });
});
