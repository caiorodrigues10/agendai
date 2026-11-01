import React from 'react';
import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/master/whatsapp', label: 'Visão geral' },
  { to: '/master/whatsapp/shops', label: 'Salões' },
  { to: '/master/whatsapp/conversations', label: 'Conversas' },
  { to: '/master/whatsapp/queues', label: 'Filas' },
  { to: '/master/whatsapp/instances', label: 'Instâncias' },
  { to: '/master/whatsapp/failures', label: 'Falhas' },
  { to: '/master/whatsapp/owner-logs', label: 'Logs assistente' },
];

export const WhatsAppTabs: React.FC = () => (
  <nav className="flex gap-2 mb-4 border-b border-border">
    {tabs.map((t) => (
      <NavLink
        key={t.to}
        to={t.to}
        end={t.to === '/master/whatsapp'}
        className={({ isActive }) =>
          `px-3 py-2 text-sm ${isActive ? 'border-b-2 border-accent font-bold' : 'text-text-muted'}`
        }
      >
        {t.label}
      </NavLink>
    ))}
  </nav>
);
