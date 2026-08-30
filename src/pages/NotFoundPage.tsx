import React, { useEffect } from 'react';
import { Home, LayoutDashboard, LogIn, SearchX } from 'lucide-react';
import { SystemStatePage } from '../components/infra/SystemStatePage';
import { useAuth } from '../contexts/AuthContext';
import { staffHomePath } from '../utils/subscriptionPaywall';

export const NotFoundPage: React.FC = () => {
  const { user } = useAuth();
  const destination = user ? staffHomePath(user.role) : '/login';

  useEffect(() => {
    const previousTitle = document.title;
    const existingRobotsMeta = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const previousRobotsContent = existingRobotsMeta?.getAttribute('content') ?? null;
    const robotsMeta = existingRobotsMeta ?? document.createElement('meta');

    if (!existingRobotsMeta) {
      robotsMeta.name = 'robots';
      document.head.appendChild(robotsMeta);
    }

    document.title = 'Página não encontrada | AgendAI';
    robotsMeta.content = 'noindex, nofollow';

    return () => {
      document.title = previousTitle;
      if (!existingRobotsMeta) {
        robotsMeta.remove();
      } else if (previousRobotsContent === null) {
        robotsMeta.removeAttribute('content');
      } else {
        robotsMeta.content = previousRobotsContent;
      }
    };
  }, []);

  return (
    <SystemStatePage
      code="404"
      title="Página não encontrada"
      description="Este endereço não existe ou pode ter mudado. Você pode voltar ao início ou seguir para sua área no AgendAI."
      icon={<SearchX size={36} strokeWidth={1.8} aria-hidden="true" />}
      primaryAction={{
        label: 'Voltar ao início',
        href: '/',
        icon: <Home size={17} aria-hidden="true" />,
      }}
      secondaryAction={{
        label: user ? 'Ir para o painel' : 'Entrar',
        href: destination,
        icon: user ? (
          <LayoutDashboard size={17} aria-hidden="true" />
        ) : (
          <LogIn size={17} aria-hidden="true" />
        ),
      }}
    />
  );
};

export default NotFoundPage;
