import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authStorage } from '../../infra/authStorage';
import { usersApi } from '../../infra/usersApi';
import { getErrorMessage } from '../../utils/errorMessage';
import {
  Download,
  Trash2,
  AlertTriangle,
  Loader2,
  FileJson,
  FileText,
  ShieldCheck,
} from 'lucide-react';

const token = () => authStorage.getAccessToken() || '';

const ROLE_LABEL: Record<string, string> = {
  MASTER_ADMIN: 'Admin',
  OWNER: 'Dono',
  EMPLOYEE: 'Funcionário',
  CUSTOMER: 'Cliente',
};

interface AccountPrivacyPanelProps {
  onNotify: (message: string, type: 'success' | 'error') => void;
}

export const AccountPrivacyPanel: React.FC<AccountPrivacyPanelProps> = ({ onNotify }) => {
  const { user } = useAuth();
  const [exporting, setExporting] = useState<'json' | 'csv' | null>(null);
  const [requestingDeletion, setRequestingDeletion] = useState(false);
  const [deletionRequested, setDeletionRequested] = useState(false);

  const handleExport = async (format: 'json' | 'csv') => {
    setExporting(format);
    try {
      const response = await fetch(`/api/users/me/export?format=${format}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!response.ok) throw new Error('Não foi possível exportar os dados.');

      const blob = new Blob([await response.blob()], {
        type: format === 'json' ? 'application/json' : 'text/csv',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meus-dados-${format}-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      onNotify('Dados exportados com sucesso!', 'success');
    } catch (err) {
      onNotify(getErrorMessage(err, 'Não foi possível exportar os dados.'), 'error');
    } finally {
      setExporting(null);
    }
  };

  const handleDeletionRequest = async () => {
    setRequestingDeletion(true);
    try {
      await usersApi.requestDeletion();
      setDeletionRequested(true);
      onNotify('Solicitação de exclusão registrada.', 'success');
    } catch (err) {
      onNotify(getErrorMessage(err, 'Não foi possível solicitar a exclusão.'), 'error');
    } finally {
      setRequestingDeletion(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-lg font-bold text-text-primary mb-1 flex items-center gap-2">
          <ShieldCheck className="text-accent" size={18} />
          Conta e privacidade
        </h3>
        <p className="text-xs text-text-muted mb-4">
          Dados da sua conta e direitos da LGPD (Lei nº 13.709/2018).
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-0.5">
              Nome
            </p>
            <p className="text-sm text-text-primary">{user?.name || '—'}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-0.5">
              E-mail
            </p>
            <p className="text-sm text-text-primary break-all">{user?.email || '—'}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-0.5">
              Função
            </p>
            <p className="text-sm text-text-primary">
              {ROLE_LABEL[user?.role ?? ''] || user?.role || '—'}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-0.5">
              E-mail verificado
            </p>
            <p className="text-sm text-text-primary">{user?.emailVerified ? 'Sim' : 'Não'}</p>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-lg font-bold text-text-primary mb-1 flex items-center gap-2">
          <Download className="text-accent" size={18} />
          Exportar meus dados
        </h3>
        <p className="text-xs text-text-muted mb-4">
          Baixe uma cópia dos seus dados pessoais, agendamentos e pagamentos (Art. 18 da LGPD).
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void handleExport('json')}
            disabled={exporting !== null}
            className="px-3 py-2 text-xs font-bold rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 disabled:opacity-50 flex items-center gap-1.5"
          >
            {exporting === 'json' ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <FileJson size={14} />
            )}
            Exportar JSON
          </button>
          <button
            type="button"
            onClick={() => void handleExport('csv')}
            disabled={exporting !== null}
            className="px-3 py-2 text-xs font-bold rounded-lg bg-surface-2 border border-border text-text-secondary hover:bg-border-strong disabled:opacity-50 flex items-center gap-1.5"
          >
            {exporting === 'csv' ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <FileText size={14} />
            )}
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="bg-surface border border-danger/30 rounded-xl p-5">
        <h3 className="text-lg font-bold text-text-primary mb-1 flex items-center gap-2">
          <AlertTriangle className="text-danger" size={18} />
          Excluir conta
        </h3>
        <p className="text-xs text-text-muted mb-4">
          Envie uma solicitação para análise. Dados que precisem ser mantidos por obrigação legal serão preservados pelo prazo aplicável.
        </p>
        <button
          type="button"
          onClick={() => void handleDeletionRequest()}
          disabled={requestingDeletion || deletionRequested}
          className="px-3 py-2 text-xs font-bold rounded-lg bg-danger/10 border border-danger/30 text-danger hover:bg-danger/20 disabled:opacity-50 flex items-center gap-1.5"
        >
          {requestingDeletion ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          {deletionRequested ? 'Solicitação em análise' : 'Solicitar exclusão'}
        </button>
      </div>
    </div>
  );
};
