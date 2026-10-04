import React, { useEffect } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { BarbershopFiltersProvider, useBarbershopFilters } from '../contexts/BarbershopFiltersContext';
import { BarbershopProvider } from '../contexts/BarbershopContext';

/**
 * Semeia o `barbershopId` do BarbershopFiltersProvider (que inicia em `null`
 * e não lê storage). Sem isso todo painel que consome o contexto fica em
 * loading infinito: o `load()` deles retorna cedo enquanto `barbershopId` é nulo.
 */
const SeedShop: React.FC<{ id: string }> = ({ id }) => {
  const { setBarbershopId } = useBarbershopFilters();
  useEffect(() => {
    setBarbershopId(id);
  }, [id, setBarbershopId]);
  return null;
};

export interface StoryProvidersProps {
  children: React.ReactNode;
  shopId?: string;
  /** Necessário para componentes que chamam `useAuth()` (ex.: CashPanel). */
  withAuth?: boolean;
  /** Necessário para `useBarbershop()`; implica AuthProvider (BarbershopProvider o consome). */
  withBarbershop?: boolean;
}

/**
 * Composição de contextos usada pelas stories dos painéis, na mesma ordem do
 * app (`src/app/index.tsx`): BarbershopFilters → Auth → Barbershop.
 */
export const StoryProviders: React.FC<StoryProvidersProps> = ({
  children,
  shopId = 'shop-1',
  withAuth = false,
  withBarbershop = false,
}) => {
  const needsAuth = withAuth || withBarbershop;
  const inner = withBarbershop ? <BarbershopProvider>{children}</BarbershopProvider> : children;
  return (
    <BarbershopFiltersProvider>
      <SeedShop id={shopId} />
      {needsAuth ? <AuthProvider>{inner}</AuthProvider> : inner}
    </BarbershopFiltersProvider>
  );
};
