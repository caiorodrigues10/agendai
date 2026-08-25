import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../infra/apiClient';
import { authStorage } from '../infra/authStorage';
import { Toast } from '../components/ui/Toast';
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

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const handleExport = async (format: 'json' | 'csv') => {
    setExporting(true);
    try {
      const response = await fetch(`/api/users/me/export?format=${format}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao exportar dados');
      }

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

      showToast('Dados exportados com sucesso!', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erro ao exportar dados', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      showToast('Digite sua senha para confirmar', 'error');
      return;
    }

    setDeleting(true);
    try {
      await apiClient<void>('/api/users/me', 'DELETE', { password: deletePassword }, token());
      showToast('Conta excluída com sucesso', 'success');
      logout();
      navigate('/login');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erro ao excluir conta', 'error');
    } finally {
      setDeleting(false);
      setDeleteConfirm(false);
      setDeletePassword('');
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Configurações da Conta</h1>
          <p className="mt-1 text-text-muted">
            Gerencie seus dados e privacidade conforme a LGPD (Lei nº 13.709/2018)
          </p>
        </div>

        <div className="space-y-6">
          {/* Perfil do Usuário */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <ShieldCheck className="text-accent" size={20} />
              Seu Perfil
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                  Nome
                </p>
                <p className="text-text-primary">{user?.name || '—'}</p>
              </div>
              <div>
                <p className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                  E-mail
                </p>
                <p className="text-text-primary">{user?.email || '—'}</p>
              </div>
              <div>
                <p className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                  Função
                </p>
                <p className="text-text-primary capitalize">{user?.role?.toLowerCase() || '—'}</p>
              </div>
              <div>
                <p className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                  E-mail verificado
                </p>
                <p className="text-text-primary">{user?.emailVerified ? 'Sim' : 'Não'}</p>
              </div>
            </div>
          </div>

          {/* Exportação de Dados (LGPD - Art. 18) */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <Download className="text-accent" size={20} />
              Exportar Meus Dados (Portabilidade)
            </h2>
            <p className="text-text-muted text-sm mb-4">
              Baixe uma cópia de todos os seus dados pessoais, agendamentos, pagamentos,
              assinaturas, indicações e feedbacks. Conforme Art. 18 da LGPD.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleExport('json')}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2.5 bg-accent/10 border border-accent/30 text-accent rounded-lg font-medium hover:bg-accent/20 transition-colors disabled:opacity-50"
              >
                <FileJson size={16} />
                {exporting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Exportando JSON...
                  </>
                ) : (
                  'Exportar JSON'
                )}
              </button>
              <button
                onClick={() => handleExport('csv')}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2.5 bg-bg border border-border text-text-primary rounded-lg font-medium hover:bg-border-strong transition-colors disabled:opacity-50"
              >
                <FileText size={16} />
                {exporting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Exportando CSV...
                  </>
                ) : (
                  'Exportar CSV'
                )}
              </button>
            </div>
          </div>

          {/* Exclusão de Conta (LGPD - Art. 18) */}
          <div className="bg-surface border border-danger/30 rounded-xl p-6">
            <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <AlertTriangle className="text-danger" size={20} />
              Excluir Conta (Direito ao Esquecimento)
            </h2>
            <p className="text-text-muted text-sm mb-4">
              Exclua permanentemente sua conta e dados pessoais. Esta ação é irreversível. Seus
              dados serão anonimizados (nome → "Usuário Excluído", e-mail → "deleted-{id}
              @agendai.local"), mas relações com a barbearia, logs de auditoria e pagamentos serão
              mantidos para conformidade legal e financeira.
            </p>

            {!deleteConfirm ? (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-danger/10 border border-danger/30 text-danger rounded-lg font-medium hover:bg-danger/20 transition-colors"
              >
                <Trash2 size={16} />
                Solicitar Exclusão da Conta
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="block text-sm text-text-secondary mb-1.5">
                    Digite sua senha para confirmar
                  </p>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={e => setDeletePassword(e.target.value)}
                    className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text-primary outline-none focus:ring-2 focus:ring-accent"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-danger border border-danger text-danger-fg rounded-lg font-medium hover:bg-danger-hover transition-colors disabled:opacity-50"
                  >
                    {deleting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Excluindo...
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        Confirmar Exclusão
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setDeleteConfirm(false);
                      setDeletePassword('');
                    }}
                    className="flex-1 flex items-center justify-center px-4 py-2.5 bg-bg border border-border text-text-secondary rounded-lg font-medium hover:bg-border-strong transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
