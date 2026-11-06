import React, { lazy, Suspense, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useBarbershopFilters } from '../contexts/BarbershopFiltersContext';
import { Loader } from '../components/ui/Loader';

// Lazy + Suspense DENTRO do wrapper: assim o wrapper commita (e roda seu
// useEffect) já na 1ª pintura, enquanto o chunk do PublicHome ainda baixa.
// Se o lazy ficasse direto aqui, o React manteria o wrapper "escondido"
// dentro da Suspense do App e o efeito só rodaria junto com o mount da rota.
const PublicHome = lazy(() => import('../pages/PublicHome'));

/**
 * Rota `/queue/:id`: aplica o tenant da URL assim que a rota casa (antes do
 * chunk do PublicHome terminar de baixar). Assim os fetches de barbearia e de
 * agenda partem junto com o early request map em vez de só após o mount.
 */
export const PublicShopRoute: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { barbershopId, setBarbershopId } = useBarbershopFilters();

  useEffect(() => {
    if (id && id !== barbershopId) setBarbershopId(id);
  }, [id, barbershopId, setBarbershopId]);

  return (
    <Suspense fallback={<Loader />}>
      <PublicHome />
    </Suspense>
  );
};
