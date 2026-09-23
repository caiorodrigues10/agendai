import React, { useCallback, useEffect, useState } from 'react';
import {
  LuCircleAlert as AlertCircle,
  LuCheck as Check,
  LuGift as Gift,
  LuInfo as Info,
  LuLoaderCircle as Loader2,
  LuSave as Save,
  LuStar as Star,
  LuToggleLeft as ToggleLeft,
  LuToggleRight as ToggleRight,
} from 'react-icons/lu';
import { loyaltyApi, LoyaltyProgram } from '../../infra/loyaltyApi';
import { useBarbershopFilters } from '../../contexts/BarbershopFiltersContext';
import { getErrorMessage } from '../../utils/errorMessage';
import { Field, FIELD_CONTROL, FORM_FOOTER } from '../ui/Field';

interface LoyaltyConfig {
  visitsRequired: number;
  rewardDescription: string;
}

const INITIAL_CONFIG: LoyaltyConfig = {
  visitsRequired: 5,
  rewardDescription: '',
};

export const LoyaltyPanel: React.FC = () => {
  const { barbershopId } = useBarbershopFilters();

  const [program, setProgram] = useState<LoyaltyProgram | null>(null);
  const [config, setConfig] = useState<LoyaltyConfig>(INITIAL_CONFIG);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    if (!barbershopId) return;
    setLoading(true);
    setError(null);
    try {
      const p = await loyaltyApi.getProgram(barbershopId);
      setProgram(p);
      setConfig({
        visitsRequired: p.config?.visitsRequired ?? 5,
        rewardDescription: p.config?.rewardDescription ?? '',
      });
      setIsActive(p.isActive);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [barbershopId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    if (!barbershopId) return;
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      const updated = await loyaltyApi.updateProgram(barbershopId, {
        isActive,
        config: {
          visitsRequired: config.visitsRequired,
          rewardDescription: config.rewardDescription,
        },
      });
      setProgram(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setSaveError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Programa de Fidelidade</h2>
        <p className="text-sm text-text-muted">
          Configure recompensas para clientes frequentes
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-[0_18px_44px_-32px_rgba(0,0,0,0.65)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                isActive
                  ? 'bg-accent text-accent-fg'
                  : 'bg-surface-2 text-text-muted'
              }`}
            >
              <Star size={20} />
            </span>
            <div>
              <p className="text-sm font-semibold text-text-primary">
                Programa ativo
              </p>
              <p className="text-xs text-text-muted">
                {isActive ? 'Clientes acumulando visitas' : 'Programa desativado'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className="text-text-secondary transition-colors hover:text-accent"
            aria-label={isActive ? 'Desativar programa' : 'Ativar programa'}
          >
            {isActive ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-[0_18px_44px_-32px_rgba(0,0,0,0.65)]">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">Configuração</h3>
        <div className="space-y-4">
          <Field
            label="Visitas necessárias"
            hint="Número de visitas para ganhar a recompensa"
          >
            <input
              type="number"
              min="1"
              value={config.visitsRequired}
              onChange={e =>
                setConfig(c => ({
                  ...c,
                  visitsRequired: Math.max(1, parseInt(e.target.value) || 1),
                }))
              }
              className={FIELD_CONTROL}
            />
          </Field>

          <Field
            label="Descrição da recompensa"
            hint="Ex: Corte grátis, Desconto de 50%, etc."
          >
            <input
              type="text"
              placeholder="Ex: Corte grátis"
              value={config.rewardDescription}
              onChange={e => setConfig(c => ({ ...c, rewardDescription: e.target.value }))}
              className={FIELD_CONTROL}
            />
          </Field>
        </div>

        {saveError && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
            <AlertCircle size={14} />
            {saveError}
          </div>
        )}

        {saved && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-xs text-success">
            <Check size={14} />
            Configuração salva com sucesso!
          </div>
        )}

        <div className={FORM_FOOTER}>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-fg shadow-md shadow-accent/15 transition-colors hover:opacity-90 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Save size={15} />
            )}
            Salvar
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-[0_18px_44px_-32px_rgba(0,0,0,0.65)]">
        <div className="mb-3 flex items-center gap-2">
          <Info size={16} className="text-accent" />
          <h3 className="text-sm font-semibold text-text-primary">Como funciona</h3>
        </div>
        <div className="space-y-3 text-sm text-text-secondary">
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/12 text-xs font-bold text-accent">
              1
            </span>
            <p>
              O cliente realiza <strong>{config.visitsRequired} visitas</strong> ao salão.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/12 text-xs font-bold text-accent">
              2
            </span>
            <p>
              Ao atingir a meta, o cliente ganha:{' '}
              <strong>{config.rewardDescription || 'Recompensa definida'}</strong>
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/12 text-xs font-bold text-accent">
              3
            </span>
            <p>O contador de visitas é zerado automaticamente após o resgate.</p>
          </div>
        </div>
      </div>

      {program && (
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-[0_18px_44px_-32px_rgba(0,0,0,0.65)]">
          <div className="flex items-center gap-2">
            <Gift size={16} className="text-accent" />
            <h3 className="text-sm font-semibold text-text-primary">Status do programa</h3>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-bg p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Tipo</p>
              <p className="mt-0.5 text-sm font-medium text-text-primary">
                {program.type === 'visits' ? 'Por visitas' : program.type}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-bg p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Status
              </p>
              <p className="mt-0.5 text-sm font-medium text-text-primary">
                {isActive ? (
                  <span className="text-success">Ativo</span>
                ) : (
                  <span className="text-text-muted">Inativo</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
