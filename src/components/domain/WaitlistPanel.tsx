import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, Plus, Trash2, Edit3, Send, Calendar, AlertTriangle } from 'lucide-react';
import { useBarbershopFilters } from '../../contexts/BarbershopFiltersContext';
import { waitlistApi, WaitlistEntry } from '../../infra/waitlistApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { formatDateBR } from '../../utils/formatters';
import { Field, FIELD_CONTROL, FORM_FOOTER, FORM_GRID } from '../ui/Field';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { EmptyState } from '../ui/EmptyState';

const STATUS_STYLES: Record<string, string> = {
  WAITING: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  OFFERED: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  ACCEPTED: 'bg-success/10 text-success border-success/30',
  DECLINED: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const STATUS_LABELS: Record<string, string> = {
  WAITING: 'Aguardando',
  OFFERED: 'Oferecido',
  ACCEPTED: 'Aceito',
  DECLINED: 'Recusado',
};

interface WaitlistFormData {
  customerName: string;
  whatsapp: string;
  serviceId: string;
  dateFrom: string;
  dateTo: string;
  preferredPeriods: string[];
  flexibilityMinutes: number;
  priority: number;
}

const INITIAL_FORM: WaitlistFormData = {
  customerName: '',
  whatsapp: '',
  serviceId: '',
  dateFrom: '',
  dateTo: '',
  preferredPeriods: [],
  flexibilityMinutes: 30,
  priority: 0,
};

export const WaitlistPanel: React.FC = () => {
  const { barbershopId } = useBarbershopFilters();
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WaitlistEntry | null>(null);
  const [form, setForm] = useState<WaitlistFormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WaitlistEntry | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [offerTarget, setOfferTarget] = useState<WaitlistEntry | null>(null);
  const [offerDate, setOfferDate] = useState('');
  const [offerTime, setOfferTime] = useState('');
  const [offering, setOffering] = useState(false);

  const load = useCallback(async () => {
    if (!barbershopId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await waitlistApi.list(barbershopId);
      setEntries(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao carregar lista de espera'));
    } finally {
      setLoading(false);
    }
  }, [barbershopId]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditingEntry(null);
    setForm(INITIAL_FORM);
    setSubmitError(null);
    setModalOpen(true);
  };

  const openEdit = (entry: WaitlistEntry) => {
    setEditingEntry(entry);
    setForm({
      customerName: entry.customerName,
      whatsapp: entry.whatsapp,
      serviceId: entry.serviceId ?? '',
      dateFrom: entry.dateFrom,
      dateTo: entry.dateTo,
      preferredPeriods: entry.preferredPeriods,
      flexibilityMinutes: entry.flexibilityMinutes,
      priority: entry.priority,
    });
    setSubmitError(null);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!barbershopId) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        ...form,
        serviceId: form.serviceId || undefined,
      };
      if (editingEntry) {
        await waitlistApi.update(barbershopId, editingEntry.id, payload);
      } else {
        await waitlistApi.create(barbershopId, payload);
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      setSubmitError(getErrorMessage(err, 'Erro ao salvar'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!barbershopId || !deleteTarget) return;
    setDeleting(true);
    try {
      await waitlistApi.remove(barbershopId, deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (err) {
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleOffer = async () => {
    if (!barbershopId || !offerTarget || !offerDate || !offerTime) return;
    setOffering(true);
    try {
      await waitlistApi.offerSlot(barbershopId, offerTarget.id, {
        offeredDate: offerDate,
        offeredTime: offerTime,
      });
      setOfferTarget(null);
      setOfferDate('');
      setOfferTime('');
      await load();
    } catch (err) {
      // silent
    } finally {
      setOffering(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-xl border border-border p-4 flex items-center justify-center py-8">
        <Loader2 className="animate-spin text-accent" size={24} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 text-danger text-sm">
          <AlertTriangle size={16} />
          <span>{error}</span>
          <button onClick={load} className="ml-auto text-accent text-xs underline">Tentar novamente</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-accent" />
          <h3 className="text-lg font-bold">Lista de Espera</h3>
          <span className="text-xs text-text-muted bg-surface-2 rounded-full px-2 py-0.5">{entries.length}</span>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-bold text-accent-fg"
        >
          <Plus size={14} /> Nova entrada
        </button>
      </div>

      {entries.length === 0 ? (
        <EmptyState title="Nenhuma entrada na lista de espera" description="Adicione clientes que desejam agendar para datas futuras." />
      ) : (
        <div className="space-y-2">
          {entries.map(entry => (
            <div key={entry.id} className="rounded-lg bg-surface-2 p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{entry.customerName}</p>
                  <p className="text-xs text-text-muted">{entry.whatsapp}</p>
                  {entry.serviceName && <p className="text-xs text-accent">{entry.serviceName}</p>}
                </div>
                <span className={`shrink-0 inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[entry.status] ?? 'border-border bg-surface text-text-muted'}`}>
                  {STATUS_LABELS[entry.status] ?? entry.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span>{formatDateBR(entry.dateFrom)} — {formatDateBR(entry.dateTo)}</span>
              </div>
              <div className="flex items-center gap-2">
                {entry.status === 'WAITING' && (
                  <button
                    onClick={() => { setOfferTarget(entry); setOfferDate(entry.dateFrom); setOfferTime(''); }}
                    className="flex items-center gap-1 rounded-md bg-accent/10 px-2 py-1 text-xs font-medium text-accent hover:bg-accent/20"
                  >
                    <Send size={12} /> Oferecer vaga
                  </button>
                )}
                <button
                  onClick={() => openEdit(entry)}
                  className="flex items-center gap-1 rounded-md bg-surface px-2 py-1 text-xs font-medium text-text-secondary hover:bg-surface-2"
                >
                  <Edit3 size={12} /> Editar
                </button>
                <button
                  onClick={() => setDeleteTarget(entry)}
                  className="flex items-center gap-1 rounded-md bg-surface px-2 py-1 text-xs font-medium text-danger hover:bg-danger/10"
                >
                  <Trash2 size={12} /> Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold">{editingEntry ? 'Editar entrada' : 'Nova entrada'}</h4>
              <button onClick={() => setModalOpen(false)} className="text-text-muted hover:text-text-primary">✕</button>
            </div>

            {submitError && (
              <div className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{submitError}</div>
            )}

            <Field label="Nome do cliente">
              <input
                className={FIELD_CONTROL}
                value={form.customerName}
                onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
              />
            </Field>

            <Field label="WhatsApp">
              <input
                className={FIELD_CONTROL}
                value={form.whatsapp}
                onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
              />
            </Field>

            <div className={FORM_GRID}>
              <Field label="Data inicial">
                <input
                  type="date"
                  className={FIELD_CONTROL}
                  value={form.dateFrom}
                  onChange={e => setForm(f => ({ ...f, dateFrom: e.target.value }))}
                />
              </Field>
              <Field label="Data final">
                <input
                  type="date"
                  className={FIELD_CONTROL}
                  value={form.dateTo}
                  onChange={e => setForm(f => ({ ...f, dateTo: e.target.value }))}
                />
              </Field>
            </div>

            <div className={FORM_GRID}>
              <Field label="Flexibilidade (min)" hint="Tolerância de horário">
                <input
                  type="number"
                  min={0}
                  className={FIELD_CONTROL}
                  value={form.flexibilityMinutes}
                  onChange={e => setForm(f => ({ ...f, flexibilityMinutes: Number(e.target.value) }))}
                />
              </Field>
              <Field label="Prioridade">
                <input
                  type="number"
                  min={0}
                  className={FIELD_CONTROL}
                  value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: Number(e.target.value) }))}
                />
              </Field>
            </div>

            <div className={FORM_FOOTER}>
              <button
                onClick={handleSubmit}
                disabled={submitting || !form.customerName || !form.dateFrom || !form.dateTo}
                className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-accent-fg disabled:opacity-60"
              >
                {submitting ? <Loader2 className="animate-spin" size={16} /> : null}
                {editingEntry ? 'Salvar' : 'Criar'}
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-2"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {offerTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-xl border border-border w-full max-w-sm p-5 space-y-4">
            <h4 className="text-base font-bold">Oferecer vaga</h4>
            <p className="text-sm text-text-secondary">Para: {offerTarget.customerName}</p>
            <div className={FORM_GRID}>
              <Field label="Data">
                <input
                  type="date"
                  className={FIELD_CONTROL}
                  value={offerDate}
                  onChange={e => setOfferDate(e.target.value)}
                />
              </Field>
              <Field label="Horário">
                <input
                  type="time"
                  className={FIELD_CONTROL}
                  value={offerTime}
                  onChange={e => setOfferTime(e.target.value)}
                />
              </Field>
            </div>
            <div className={FORM_FOOTER}>
              <button
                onClick={handleOffer}
                disabled={offering || !offerDate || !offerTime}
                className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-accent-fg disabled:opacity-60"
              >
                {offering ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                Enviar oferta
              </button>
              <button
                onClick={() => setOfferTarget(null)}
                className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-2"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remover entrada"
        message={`Deseja remover ${deleteTarget?.customerName} da lista de espera?`}
        confirmLabel="Remover"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
