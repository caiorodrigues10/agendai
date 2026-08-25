import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render } from '@testing-library/react';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    hasRole: () => false,
  }),
}));

vi.mock('../contexts/BarbershopFiltersContext', () => ({
  useBarbershopFilters: () => ({
    barbershopId: 'shop-1',
    staffId: null,
    dateRange: null,
    setBarbershopId: vi.fn(),
    setStaffId: vi.fn(),
    setDateRange: vi.fn(),
  }),
}));

vi.mock('../contexts/BarbershopContext', () => ({
  useBarbershop: () => ({
    settings: {
      shopName: 'Salão Teste',
      whatsapp: '11999999999',
      schedule: [],
      logoUrl: undefined,
    },
    services: [{ id: 's1', name: 'Corte', price: 40, avgTimeMinutes: 30, icon: 'scissors' }],
    staff: [],
    feed: [],
    loading: false,
    isShopOpen: () => true,
    addPost: vi.fn(),
    deletePost: vi.fn(),
    likePost: vi.fn(),
    refresh: vi.fn(),
    updateSettings: vi.fn(),
  }),
}));

vi.mock('../contexts/SchedulingContext', () => ({
  useScheduling: () => ({
    queue: [],
    appointments: [],
    availability: [],
    aiInsight: null,
    metrics: null,
    loading: false,
    clientId: 'client-1',
    refresh: vi.fn(),
    joinQueue: vi.fn(),
    leaveQueue: vi.fn(),
    bookAppointmentPublic: vi.fn(),
    loadAvailability: vi.fn(),
  }),
}));

describe('PublicHome smoke', () => {
  it('renderiza perfil público da barbearia', async () => {
    const { PublicHome } = await import('./PublicHome');
    render(
      <MemoryRouter initialEntries={['/queue/shop-1']}>
        <Routes>
          <Route path="/queue/:id" element={<PublicHome />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/salão teste/i)).toBeInTheDocument();
    });
  });
});
