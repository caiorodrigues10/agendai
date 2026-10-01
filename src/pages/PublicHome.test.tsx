/// <reference types="vitest/globals" />
import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, fireEvent } from '@testing-library/react';
import { PublicHome } from './PublicHome';

const { mockJoinQueue, mockOperationMode, mockPublicProducts } = vi.hoisted(() => ({
  mockJoinQueue: vi.fn(),
  mockOperationMode: { value: 'HYBRID' as string },
  mockPublicProducts: vi.fn(),
}));

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
      operationMode: mockOperationMode.value,
    },
    services: [{ id: 's1', name: 'Corte', price: 40, avgTimeMinutes: 30, icon: 'scissors' }],
    staff: [],
    feed: [],
    loading: false,
    isShopOpen: () => true,
    isQueueClosed: () => false,
    addPost: vi.fn(),
    deletePost: vi.fn(),
    likePost: vi.fn(),
    refresh: vi.fn(),
    updateSettings: vi.fn(),
  }),
}));

vi.mock('../contexts/SchedulingContext', () => ({
  useScheduling: () => ({
    queue: [
      {
        id: 'q1',
        customerId: 'client-1',
        customerName: 'Cliente principal',
        whatsapp: '11999999999',
        serviceId: 's1',
        joinedAt: Date.now(),
        status: 'waiting',
      },
    ],
    appointments: [],
    availability: [],
    aiInsight: null,
    metrics: null,
    loading: false,
    clientId: 'client-1',
    refresh: vi.fn(),
    joinQueue: mockJoinQueue,
    leaveQueue: vi.fn(),
    bookAppointmentPublic: vi.fn(),
    loadAvailability: vi.fn(),
  }),
}));

vi.mock('../infra/schedulingApi', () => ({
  schedulingApi: {
    getAppointmentSlots: vi.fn(async () => []),
  },
}));

vi.mock('../components/domain/AppointmentScheduler', () => ({
  AppointmentScheduler: () => null,
}));

vi.mock('../components/domain/ShopProfile', () => ({
  ShopProfile: () => null,
}));

vi.mock('../infra/publicProductsApi', () => ({
  publicProductsApi: {
    list: mockPublicProducts,
    get: vi.fn(),
    reserve: vi.fn(),
  },
}));

function renderPublicHome() {
  return render(
    <MemoryRouter initialEntries={['/queue/shop-1']}>
      <Routes>
        <Route path="/queue/:id" element={<PublicHome />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('PublicHome smoke', () => {
  it('renderiza perfil público da barbearia', () => {
    renderPublicHome();
    expect(screen.getByText(/salão teste/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /adicionar dependente/i })).toBeInTheDocument();
  });

  it('envia dependente como pessoa adicional na fila', async () => {
    mockJoinQueue.mockClear();
    renderPublicHome();

    expect(screen.getByText(/salão teste/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /adicionar dependente/i }));
    fireEvent.change(screen.getByPlaceholderText(/ex: joão silva/i), {
      target: { value: 'Maria Silva' },
    });
    fireEvent.click(screen.getByRole('button', { name: /adicionar à fila/i }));

    await waitFor(() => {
      expect(mockJoinQueue).toHaveBeenCalledWith('Maria Silva', '', 's1', { additionalPerson: true });
    });
  });
});

const PRODUCT = {
  id: 'p1',
  name: 'Pomada modeladora',
  description: null,
  imageUrl: null,
  price: 30,
  unitLabel: 'un',
  category: null,
  available: 2,
};

describe('PublicHome — carrossel de produtos', () => {
  beforeEach(() => {
    mockOperationMode.value = 'HYBRID';
    mockPublicProducts.mockReset();
    mockPublicProducts.mockResolvedValue({
      shop: { name: 'Salão Teste', address: null, city: null, whatsapp: '11999999999' },
      products: [PRODUCT],
    });
  });

  afterEach(() => {
    mockOperationMode.value = 'HYBRID';
  });

  it('não mostra o carrossel na aba Fila e mostra nas abas Agenda e Perfil', async () => {
    renderPublicHome();

    expect(screen.queryByRole('region', { name: 'Produtos para reserva' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Agenda' }));
    expect(
      await screen.findByRole('region', { name: 'Produtos para reserva' })
    ).toBeInTheDocument();
    expect(screen.getByText('Pomada modeladora')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Perfil' }));
    expect(
      await screen.findByRole('region', { name: 'Produtos para reserva' })
    ).toBeInTheDocument();
    expect(screen.getByText('Pomada modeladora')).toBeInTheDocument();
  });

  it('mostra os produtos pela aba Perfil quando o salão é só com fila (QUEUE_ONLY)', async () => {
    mockOperationMode.value = 'QUEUE_ONLY';
    renderPublicHome();

    expect(screen.queryByRole('button', { name: 'Agenda' })).toBeNull();
    expect(screen.queryByRole('region', { name: 'Produtos para reserva' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Perfil' }));
    expect(
      await screen.findByRole('region', { name: 'Produtos para reserva' })
    ).toBeInTheDocument();
    expect(screen.getByText('Pomada modeladora')).toBeInTheDocument();
    expect(mockPublicProducts).toHaveBeenCalledWith('shop-1');
  });
});
