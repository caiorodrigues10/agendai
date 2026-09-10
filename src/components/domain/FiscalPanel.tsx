import React, { useEffect, useState } from 'react';
import { FileText, Loader2, Settings, XCircle } from 'lucide-react';
import { fiscalApi, FiscalConfig, NfeRecord, FiscalStats } from '../../infra/fiscalApi';
import { useBarbershopFilters } from '../../contexts/BarbershopFiltersContext';
import { getErrorMessage } from '../../utils/errorMessage';

export const FiscalPanel: React.FC = () => {
  const { barbershopId } = useBarbershopFilters();

  const [config, setConfig] = useState<FiscalConfig | null>(null);
  const [records, setRecords] = useState<NfeRecord[]>([]);
  const [stats, setStats] = useState<FiscalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'config' | 'records' | 'stats'>('config');
  const [submitting, setSubmitting] = useState(false);

  // Config form
  const [cnpj, setCnpj] = useState('');
  const [stateReg, setStateReg] = useState('');
  const [municipalReg, setMunicipalReg] = useState('');
  const [serviceCode, setServiceCode] = useState('');
  const [activityCode, setActivityCode] = useState('');
  const [nfeEnabled, setNfeEnabled] = useState(false);
  const [nfeEnv, setNfeEnv] = useState('HOMOLOGATION');

  // Issue form
  const [recipientName, setRecipientName] = useState('');
  const [recipientDoc, setRecipientDoc] = useState('');
  const [serviceValue, setServiceValue] = useState('');
  const [taxValue, setTaxValue] = useState('');
  const [showIssue, setShowIssue] = useState(false);

  useEffect(() => {
    if (!barbershopId) return;
    setLoading(true);
    Promise.all([
      fiscalApi.getConfig(barbershopId),
      fiscalApi.listRecords(barbershopId),
      fiscalApi.getStats(barbershopId),
    ])
      .then(([c, res, s]) => {
        setConfig(c);
        if (c) {
          setCnpj(c.cnpj);
          setStateReg(c.stateRegistration ?? '');
          setMunicipalReg(c.municipalRegistration ?? '');
          setServiceCode(c.serviceCode ?? '');
          setActivityCode(c.activityCode ?? '');
          setNfeEnabled(c.nfeEnabled);
          setNfeEnv(c.nfeEnvironment);
        }
        setRecords(res.data);
        setStats(s);
      })
      .catch(err => setError(getErrorMessage(err, 'Erro ao carregar dados fiscais.')))
      .finally(() => setLoading(false));
  }, [barbershopId]);

  const handleSaveConfig = async () => {
    if (!barbershopId || !cnpj.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const updated = await fiscalApi.updateConfig(barbershopId, {
        cnpj: cnpj.trim(),
        stateRegistration: stateReg.trim() || null,
        municipalRegistration: municipalReg.trim() || null,
        serviceCode: serviceCode.trim() || null,
        activityCode: activityCode.trim() || null,
        nfeEnabled,
        nfeEnvironment: nfeEnv,
      });
      setConfig(updated);
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao salvar configuração.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleIssue = async () => {
    if (!barbershopId || !recipientName.trim() || !recipientDoc.trim() || !serviceValue) return;
    setSubmitting(true);
    setError('');
    try {
      const record = await fiscalApi.issueNfe(barbershopId, {
        recipientName: recipientName.trim(),
        recipientDoc: recipientDoc.trim(),
        serviceValue: Number(serviceValue),
        taxValue: taxValue ? Number(taxValue) : 0,
      });
      setRecords(prev => [record, ...prev]);
      setShowIssue(false);
      setRecipientName('');
      setRecipientDoc('');
      setServiceValue('');
      setTaxValue('');
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao emitir NFS-e.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!barbershopId) return;
    if (!confirm('Deseja cancelar esta NFS-e?')) return;
    setSubmitting(true);
    setError('');
    try {
      const updated = await fiscalApi.cancelNfe(barbershopId, id);
      setRecords(prev => prev.map(r => (r.id === id ? updated : r)));
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao cancelar NFS-e.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={28} />
      </div>
    );
  }

  const statusColor = (s: string) => {
    if (s === 'AUTHORIZED') return 'text-success';
    if (s === 'CANCELED') return 'text-error';
    if (s === 'ERROR') return 'text-error';
    return 'text-text-muted';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-text-primary">Fiscal / NFS-e</h3>
        <div className="flex gap-2">
          {(['config', 'records', 'stats'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                tab === t ? 'bg-accent text-accent-fg' : 'bg-surface text-text-secondary hover:bg-surface-2'
              }`}
            >
              {t === 'config' ? 'Configuração' : t === 'records' ? 'Notas' : 'Estatísticas'}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-xs text-error">{error}</p>}

      {/* Config Tab */}
      {tab === 'config' && (
        <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Settings size={16} className="text-text-muted" />
            <p className="text-xs font-bold text-text-secondary">Dados Fiscais</p>
          </div>
          <input
            placeholder="CNPJ"
            value={cnpj}
            onChange={e => setCnpj(e.target.value)}
            className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Inscrição Estadual"
              value={stateReg}
              onChange={e => setStateReg(e.target.value)}
              className="rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
            />
            <input
              placeholder="Inscrição Municipal"
              value={municipalReg}
              onChange={e => setMunicipalReg(e.target.value)}
              className="rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Código de Serviço"
              value={serviceCode}
              onChange={e => setServiceCode(e.target.value)}
              className="rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
            />
            <input
              placeholder="Código de Atividade"
              value={activityCode}
              onChange={e => setActivityCode(e.target.value)}
              className="rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={nfeEnabled}
                onChange={e => setNfeEnabled(e.target.checked)}
                className="accent-accent"
              />
              NFS-e Habilitada
            </label>
            <select
              value={nfeEnv}
              onChange={e => setNfeEnv(e.target.value)}
              className="rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
            >
              <option value="HOMOLOGATION">Homologação</option>
              <option value="PRODUCTION">Produção</option>
            </select>
          </div>
          <button
            onClick={() => void handleSaveConfig()}
            disabled={submitting || !cnpj.trim()}
            className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-accent-fg disabled:opacity-50"
          >
            {submitting ? <Loader2 className="animate-spin" size={14} /> : <Settings size={14} />}
            Salvar Configuração
          </button>
        </div>
      )}

      {/* Records Tab */}
      {tab === 'records' && (
        <>
          <div className="flex justify-end">
            <button
              onClick={() => setShowIssue(!showIssue)}
              className="inline-flex items-center gap-1 rounded-xl bg-accent/10 px-3 py-2 text-xs font-bold text-accent hover:bg-accent/20"
            >
              <FileText size={14} /> Emitir NFS-e
            </button>
          </div>

          {showIssue && (
            <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
              <p className="text-xs font-bold text-text-secondary">Emitir NFS-e</p>
              <input
                placeholder="Nome do destinatário"
                value={recipientName}
                onChange={e => setRecipientName(e.target.value)}
                className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
              />
              <input
                placeholder="CPF/CNPJ do destinatário"
                value={recipientDoc}
                onChange={e => setRecipientDoc(e.target.value)}
                className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min={0.01}
                  step={0.01}
                  placeholder="Valor do serviço"
                  value={serviceValue}
                  onChange={e => setServiceValue(e.target.value)}
                  className="rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
                />
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="Valor do imposto"
                  value={taxValue}
                  onChange={e => setTaxValue(e.target.value)}
                  className="rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => void handleIssue()}
                  disabled={submitting || !recipientName.trim() || !recipientDoc.trim() || !serviceValue}
                  className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-accent-fg disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin" size={14} /> : <FileText size={14} />}
                  Emitir
                </button>
                <button onClick={() => setShowIssue(false)} className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-text-secondary hover:bg-surface-2">
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {records.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
              <FileText size={32} className="mx-auto text-text-muted" />
              <p className="mt-2 text-sm text-text-secondary">Nenhuma NFS-e emitida.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {records.map(r => (
                <div key={r.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
                  <FileText size={16} className="text-text-muted shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-text-primary">
                      NFS-e #{r.nfseNumber ?? '—'}
                    </p>
                    <p className="text-[10px] text-text-muted truncate">
                      {r.recipientName} · {r.recipientDoc} · {r.issuedAt ? new Date(r.issuedAt).toLocaleDateString('pt-BR') : '—'}
                    </p>
                  </div>
                  <span className={`text-xs font-bold ${statusColor(r.status)}`}>{r.status}</span>
                  <span className="text-sm font-bold text-text-primary">R$ {Number(r.serviceValue).toFixed(2)}</span>
                  {r.status === 'AUTHORIZED' && (
                    <button
                      onClick={() => void handleCancel(r.id)}
                      disabled={submitting}
                      className="text-error hover:text-error/80"
                    >
                      <XCircle size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Stats Tab */}
      {tab === 'stats' && stats && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4 text-center">
              <p className="text-2xl font-bold text-accent">R$ {stats.totalIssued.toFixed(2)}</p>
              <p className="text-xs text-text-muted">Total Emitido</p>
            </div>
            <div className="rounded-2xl border border-warning/30 bg-warning/5 p-4 text-center">
              <p className="text-2xl font-bold text-warning">R$ {stats.totalTax.toFixed(2)}</p>
              <p className="text-xs text-text-muted">Total Impostos</p>
            </div>
          </div>

          {Object.keys(stats.monthly).length > 0 && (
            <div className="rounded-2xl border border-border bg-surface p-4 space-y-2">
              <p className="text-xs font-bold text-text-secondary mb-2">Mensal</p>
              {Object.entries(stats.monthly)
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([key, m]) => (
                  <div key={key} className="flex items-center justify-between rounded-xl bg-bg px-3 py-2">
                    <span className="text-xs text-text-secondary">{key}</span>
                    <div className="flex gap-4 text-xs">
                      <span className="text-text-primary font-bold">{m.count} nota{m.count > 1 ? 's' : ''}</span>
                      <span className="text-text-primary font-bold">R$ {m.total.toFixed(2)}</span>
                      <span className="text-warning font-bold">Imp. R$ {m.tax.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
