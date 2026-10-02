import React, { useEffect, useState } from 'react';
import { barbershopApi } from '../../infra/barbershopApi';
import type { AppointmentPolicy } from '../../infra/barbershopApi';
import { getErrorMessage } from '../../utils/errorMessage';

const DEFAULT_APPOINTMENT_POLICY: AppointmentPolicy = {
  bookingNoticeMinutes: 60,
  cancelNoticeMinutes: 120,
  rescheduleNoticeMinutes: 120,
  bookingHorizonDays: 60,
  allowPublicCancellation: true,
  allowPublicReschedule: true,
  requestReview: true,
};

export const AppointmentPolicySection: React.FC<{ barbershopId: string; onNotify: (message: string, type: 'success' | 'error') => void }> = ({ barbershopId, onNotify }) => {
  const [policy, setPolicy] = useState<AppointmentPolicy>(DEFAULT_APPOINTMENT_POLICY);
  const [saving, setSaving] = useState(false);
  useEffect(() => { barbershopApi.getAppointmentPolicy(barbershopId).then(setPolicy).catch(() => undefined); }, [barbershopId]);
  const update = (field: keyof AppointmentPolicy, value: number | boolean) => setPolicy(current => ({ ...current, [field]: value }));
  const save = async () => { setSaving(true); try { const next = await barbershopApi.updateAppointmentPolicy(barbershopId, policy); setPolicy(next); onNotify('Regras da agenda atualizadas.', 'success'); } catch (err) { onNotify(getErrorMessage(err, 'Não foi possível salvar as regras da agenda.'), 'error'); } finally { setSaving(false); } };
  return <div className="bg-surface border border-border rounded-xl p-5"><h3 className="text-lg font-bold text-text-primary mb-1">Regras da agenda pública</h3><p className="text-xs text-text-muted mb-4">Defina até quando o cliente pode reservar, cancelar ou remarcar.</p><div className="grid gap-3 sm:grid-cols-3">{([['bookingNoticeMinutes', 'Antecedência para reservar'], ['cancelNoticeMinutes', 'Prazo para cancelar'], ['rescheduleNoticeMinutes', 'Prazo para remarcar']] as const).map(([field, label]) => <label key={field} className="text-xs text-text-secondary">{label}<input type="number" min={0} max={10080} value={policy[field]} onChange={event => update(field, Number(event.target.value))} className="mt-1 w-full rounded-lg bg-bg border border-border p-2 text-text-primary" /><span className="text-[10px] text-text-muted">minutos</span></label>)}</div><label className="block text-xs text-text-secondary mt-3">Reservas até<input type="number" min={1} max={365} value={policy.bookingHorizonDays} onChange={event => update('bookingHorizonDays', Number(event.target.value))} className="mt-1 w-32 rounded-lg bg-bg border border-border p-2 text-text-primary" /> <span className="text-[10px] text-text-muted">dias no futuro</span></label><div className="grid gap-2 sm:grid-cols-3 mt-4">{([['allowPublicCancellation', 'Permitir cancelamento'], ['allowPublicReschedule', 'Permitir remarcação'], ['requestReview', 'Pedir avaliação']] as const).map(([field, label]) => <label key={field} className="flex items-center gap-2 text-sm text-text-secondary"><input type="checkbox" checked={policy[field]} onChange={event => update(field, event.target.checked)} />{label}</label>)}</div><button type="button" disabled={saving} onClick={() => void save()} className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-accent-fg disabled:opacity-50">{saving ? 'Salvando...' : 'Salvar regras'}</button></div>;
};
