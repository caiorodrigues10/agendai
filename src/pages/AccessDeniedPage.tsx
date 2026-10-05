import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LuShieldAlert as ShieldAlert, LuArrowLeft as ArrowLeft } from 'react-icons/lu';
import { getDefaultTab } from '../config/tabRegistry';
import { useAuth } from '../contexts/AuthContext';

interface AccessDeniedPageProps {
  /** Aba que o usuário tentou abrir diretamente (ex.: /app/finance). */
  attemptedTab?: string;
}

/**
 * Página exibida quando o papel/permissões do usuário não autorizam a aba.
 * Não redireciona cegamente: mostra o bloqueio e oferece voltar.
 */
export const AccessDeniedPage: React.FC<AccessDeniedPageProps> = ({ attemptedTab }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const goBack = () => {
    const target = getDefaultTab(user?.role, undefined, { permissions: user?.permissions });
    navigate(`/app/${target}`, { replace: true });
  };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/10 text-danger">
        <ShieldAlert size={28} aria-hidden />
      </div>
      <h1 className="font-display text-xl font-bold text-text-primary">Acesso negado</h1>
      <p className="max-w-sm text-sm text-text-secondary">
        {attemptedTab
          ? `Você não tem permissão para abrir esta seção (${attemptedTab}). Se precisar de acesso, fale com o dono do salão.`
          : 'Você não tem permissão para abrir esta seção. Se precisar de acesso, fale com o dono do salão.'}
      </p>
      <button
        type="button"
        onClick={goBack}
        className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-5 font-semibold text-header transition hover:bg-accent-strong"
      >
        <ArrowLeft size={18} aria-hidden />
        Voltar para o painel
      </button>
    </div>
  );
};

export default AccessDeniedPage;
