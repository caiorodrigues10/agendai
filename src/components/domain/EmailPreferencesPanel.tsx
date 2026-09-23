import React, { useState, useEffect, useCallback } from 'react';
import {
  LuMail as Mail,
  LuShieldCheck as ShieldCheck,
  LuLoaderCircle as Loader2,
  LuTriangleAlert as AlertTriangle,
  LuCalendarDays as CalendarDays,
} from 'react-icons/lu';
import { emailApi } from '../../infra/emailApi';
import { Toast } from '../ui/Toast';

interface EmailPreferencesPanelProps {
  barbershopId: string;
  onNotify: (message: string, type: 'success' | 'error') => void;
}

type CategoryDef = {
  key: 'ESSENTIAL' | 'OPERATION' | 'MARKETING';
  label: string;
  description: string;
  examples: string[];
  canDisable: boolean;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
};

const CATEGORIES: CategoryDef[] = [
  {
    key: 'ESSENTIAL',
    label: 'Segurança da conta',
    description: 'Sempre enviados para proteger sua conta.',
    examples: ['Senha alterada', 'Criação de funcionário', 'Pagamento aprovado/rejeitado'],
    canDisable: false,
    icon: ShieldCheck,
  },
  {
    key: 'OPERATION',
    label: 'Operação do salão',
    description: 'Resumo diário, cancelamentos e remarcações urgentes.',
    examples: ['Resumo do dia (agenda)', 'Cancelamento urgente', 'Reagendamento urgente'],
    canDisable: true,
    icon: CalendarDays,
  },
  {
    key: 'MARKETING',
    label: 'Novidades e conteúdo',
    description: 'Dicas, novidades e conteúdo sobre o AgendAI.',
    examples: ['Como melhorar seu agendamento', 'Novos recursos no painel'],
    canDisable: true,
    icon: Mail,
  },
];

export const EmailPreferencesPanel: React.FC<EmailPreferencesPanelProps> = ({
  barbershopId,
  onNotify,
}) => {
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!barbershopId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await emailApi.getPreferences(barbershopId);
      setPrefs(Object.fromEntries(data.map((d: { category: string; enabled: boolean }) => [d.category, d.enabled])));
    } catch (err) {
      setError('Não foi possível carregar as preferências de e-mail.');
    } finally {
      setLoading(false);
    }
  }, [barbershopId]);

  useEffect(() => { void load(); }, [load]);

  const toggle = async (category: string, enabled: boolean) => {
    if (!barbershopId) return;
    setSaving(category);
    setError(null);
    try {
      await emailApi.updatePreference(barbershopId, category as 'OPERATION' | 'MARKETING', enabled);
      setPrefs(prev => ({ ...prev, [category]: enabled }));
      onNotify(enabled ? 'Ativado.' : 'Desativado.', 'success');
    } catch (err) {
      onNotify('Não foi possível salvar.', 'error');
    } finally {
      setSaving(null);
    }
  };

  const handleAllOff = async () => {
    if (!barbershopId) return;
    setError(null);
    try {
      const toDisable = CATEGORIES.filter(c => c.canDisable && prefs[c.key]);
      for (const c of toDisable) {
        await emailApi.updatePreference(barbershopId, c.key, false);
        setPrefs(prev => ({ ...prev, [c.key]: false }));
      }
      onNotify('E-mails opcionais desativados.', 'success');
    } catch {
      onNotify('Não foi possível desativar.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Mail size={18} className="text-accent" aria-hidden /> Notificações por e-mail
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Escolha quais e-mails você quer receber no endereço da sua conta.
          </p>
        </div>
        {error ? (
          <span className="flex items-center gap-1.5 text-xs text-danger">
            <AlertTriangle size={14} aria-hidden /> Erro ao carregar
          </span>
        ) : null}
      </div>

      {/* Categorias */}
      <div className="space-y-3">
        {CATEGORIES.map(({ key, label, description, examples, canDisable, icon: Icon }) => {
          const enabled = prefs[key] ?? false;
          const disabledByPolicy = !canDisable;
          const isToggling = saving === key;

          return (
            <div
              key={key}
              className={`rounded-xl border transition ${
                enabled
                  ? 'border-accent/20 bg-accent/5'
                  : 'border-border bg-surface'
              }`}
            >
              <div className="flex items-start justify-between gap-3 p-4">
                <div className="flex items-start gap-3">
                  <div className={`rounded-lg p-2 shrink-0 ${enabled ? 'bg-accent/10 text-accent' : 'bg-bg text-text-muted'}`}>
                    <Icon size={18} aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-text-primary">{label}</h4>
                    <p className="text-xs text-text-secondary mt-1 leading-relaxed">{description}</p>
                    <ul className="mt-2 space-y-1">
                      {examples.map(ex => (
                        <li key={ex} className="text-xs text-text-muted">
                          • {ex}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Toggle */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  {disabledByPolicy ? (
                    <span className="rounded-full border border-border bg-bg px-3 py-1 text-xs font-bold text-text-muted">
                      Obrigatório
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggle(key, !enabled)}
                      disabled={isToggling}
                      aria-pressed={enabled}
                      className={`relative h-7 w-12 rounded-full border-2 transition ${
                        enabled
                          ? 'bg-accent border-accent'
                          : 'bg-surface border-border'
                      } ${isToggling ? 'opacity-50' : 'cursor-pointer'}`}
                      aria-label={enabled ? `Desativar ${label}` : `Ativar ${label}`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          enabled ? 'translate-x-5' : ''
                        }`}
                      />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ações em massa */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-bg px-4 py-3">
        <p className="text-sm text-text-secondary">
          Quiser ajustar fino por tipo? Clique em uma categoria acima.
        </p>
        {CATEGORIES.some(c => c.canDisable && prefs[c.key]) && (
          <button
            type="button"
            onClick={() => void handleAllOff()}
            className="min-h-10 rounded-xl border border-border px-3 text-xs font-bold text-text-secondary hover:border-danger/40 hover:text-danger"
          >
            Desativar opcionais
          </button>
        )}
      </div>
    </div>
  );
};
