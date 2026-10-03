import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuShieldAlert } from 'react-icons/lu';
import { useAuth } from '../../contexts/AuthContext';
import { impersonationStorage } from '../../infra/impersonationStorage';

const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

/**
 * Faixa vermelha exibida enquanto o master está em impersonation:
 * identifica o salão, conta regressiva de 30min e oferece a saída.
 * Montada fora do layout do app (empurra o conteúdo, não sobrepõe).
 */
export const ImpersonationBanner: React.FC = () => {
  const { impersonationShop, exitImpersonation } = useAuth();
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!impersonationShop) return;
    const sync = () => {
      const left = impersonationStorage.secondsLeft();
      if (left <= 0) {
        exitImpersonation();
        return false;
      }
      setSeconds(left);
      return true;
    };
    // Primeira leitura em timeout (nada de setState síncrono no effect);
    // depois um tique por segundo até a sessão expirar.
    const kick = setTimeout(() => sync(), 0);
    const timer = setInterval(() => {
      if (!sync()) clearInterval(timer);
    }, 1000);
    return () => {
      clearTimeout(kick);
      clearInterval(timer);
    };
  }, [impersonationShop, exitImpersonation]);

  if (!impersonationShop) return null;

  const handleExit = () => {
    const shopId = impersonationShop.id;
    exitImpersonation();
    navigate(`/master/accounts/${shopId}`);
  };

  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-danger px-4 py-2 text-center text-xs font-bold text-white sm:text-sm"
    >
      <span className="inline-flex items-center gap-1.5">
        <LuShieldAlert size={16} aria-hidden />
        Visão temporária somente-leitura — {impersonationShop.name}
      </span>
      <span className="font-mono">expira em {formatTime(seconds)}</span>
      <button
        type="button"
        onClick={handleExit}
        className="rounded-lg bg-white/20 px-3 py-1 font-bold hover:bg-white/30"
      >
        Encerrar
      </button>
    </div>
  );
};

export default ImpersonationBanner;
