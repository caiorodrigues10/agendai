import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Check,
  Gift,
  Loader2,
  Ticket,
  Users,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { referralsApi, ReferralDashboard } from '../../infra/referralsApi';
import { ReferralTierBadge } from './ReferralTierBadge';
import { ShareReferralButton } from './ShareReferralButton';
import { getErrorMessage } from '../../utils/errorMessage';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Aguardando pagamento',
  QUALIFIED: 'Qualificada',
  REWARDED: 'Recompensada',
  REJECTED: 'Revertida',
};

const STATUS_STYLES: Record<string, string> = {
  REWARDED: 'bg-success/15 text-success',
  PENDING: 'bg-warning/15 text-warning',
  REJECTED: 'bg-danger/15 text-danger',
  QUALIFIED: 'bg-accent/15 text-accent',
};

export const OwnerReferralsPanel: React.FC = () => {
  const [data, setData] = useState<ReferralDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState('');
  const [applyingCode, setApplyingCode] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await referralsApi.me();
      setData(res);
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível carregar indicações.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-24 bg-surface-2 rounded-2xl" />
        <div className="h-16 bg-surface-2 rounded-2xl" />
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-surface-2 rounded-xl" />
          ))}
        </div>
        <div className="h-48 bg-surface-2 rounded-2xl" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-4 rounded-xl border border-danger/30 bg-danger/10 text-danger text-sm flex gap-2 items-start">
        <AlertCircle size={16} className="shrink-0 mt-0.5" />
        <div className="flex-1">
          {error}
          <button
            type="button"
            onClick={() => void load()}
            className="mt-2 text-xs font-bold underline"
          >
            Tentar de novo
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const conversionRate =
    data.stats.total > 0 ? ((data.stats.converted / data.stats.total) * 100).toFixed(0) : '0';

  const shareText = `Use meu link para se cadastrar no AGENDAI: ${data.shareUrl}`;

  const handleApplyCode = async () => {
    const code = referralCode.trim().toUpperCase();
    if (!code) return;
    setApplyingCode(true);
    setError(null);
    try {
      await referralsApi.applyCode(code);
      setReferralCode('');
      await load();
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível aplicar este código.'));
    } finally {
      setApplyingCode(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-extrabold text-text-primary flex items-center gap-2">
          <Gift size={20} className="text-accent" />
          Indicações
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Indique outro salão. Quando ele assinar, você ganha dias na sua conta.
        </p>
      </div>

      <ReferralTierBadge
        tier={data.tier.name}
        convertedCount={data.convertedCount}
        nextTierIn={data.nextTierIn}
      />

      <section className="rounded-2xl border border-accent/25 bg-accent/5 p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-fg">
            <Ticket size={19} />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-text-primary">Foi indicado por alguém?</h3>
            <p className="mt-1 text-xs leading-relaxed text-text-secondary">
              Informe o código recebido para registrar a indicação. Ele só pode ser usado uma vez
              para este salão.
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={referralCode}
            onChange={event => setReferralCode(event.target.value.toUpperCase())}
            onKeyDown={event => {
              if (event.key === 'Enter') void handleApplyCode();
            }}
            maxLength={32}
            placeholder="EX.: EP6V4AAS"
            className="min-w-0 flex-1 rounded-xl border border-border bg-bg px-3 py-2.5 text-sm font-bold tracking-wider text-text-primary outline-none focus:ring-2 focus:ring-accent"
            aria-label="Código de indicação recebido"
          />
          <button
            type="button"
            onClick={() => void handleApplyCode()}
            disabled={!referralCode.trim() || applyingCode}
            className="inline-flex shrink-0 items-center justify-center gap-1 rounded-xl bg-accent px-3 py-2.5 text-xs font-bold text-accent-fg transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {applyingCode ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
            Aplicar
          </button>
        </div>
      </section>

      <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
          Seu link de indicação
        </p>
        <code className="block text-xs sm:text-sm bg-bg border border-border rounded-xl px-3 py-2.5 text-text-primary truncate">
          {data.shareUrl}
        </code>
        <ShareReferralButton shareUrl={data.shareUrl} shareText={shareText} />
        <p className="text-[11px] text-text-muted">
          Código: <strong className="text-text-secondary">{data.code}</strong> · +{data.rewardDays}{' '}
          dias por conversão
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'Pendentes', value: data.stats.pending, icon: Users },
          { label: 'Convertidas', value: data.stats.converted, icon: TrendingUp },
          { label: 'Revertidas', value: data.stats.rejected, icon: XCircle },
          { label: 'Dias ganhos', value: data.stats.creditDays, icon: Gift },
        ].map(s => (
          <div
            key={s.label}
            className="rounded-xl border border-border bg-bg px-3 py-3 text-center"
          >
            <s.icon size={14} className="mx-auto text-accent mb-1" />
            <p className="text-lg font-black text-text-primary">{s.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mt-0.5">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-bg px-4 py-3 flex items-center justify-between">
        <p className="text-sm text-text-secondary">Taxa de conversão</p>
        <p className="text-sm font-bold text-text-primary">{conversionRate}%</p>
      </div>

      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <Users size={14} className="text-accent" />
          <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            Histórico
          </p>
        </div>
        {data.referrals.length === 0 ? (
          <p className="p-4 text-sm text-text-muted">
            Nenhuma indicação ainda. Compartilhe seu link com outros donos de salão.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {data.referrals.map(r => (
              <li key={r.id} className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{r.shopName}</p>
                  <p className="text-[11px] text-text-muted">
                    {new Date(r.createdAt).toLocaleDateString('pt-BR')}
                    {r.status === 'REWARDED' ? ` · +${r.rewardDays} dias` : ''}
                    {r.status === 'REJECTED' ? ` · -${r.rewardDays} dias` : ''}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                    STATUS_STYLES[r.status] ?? 'bg-surface-2 text-text-muted'
                  }`}
                >
                  {STATUS_LABEL[r.status] ?? r.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <p className="text-xs text-danger flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
};
