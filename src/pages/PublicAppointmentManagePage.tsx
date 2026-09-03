import React from 'react';
import { Calendar, CheckCircle, Loader2, XCircle } from 'lucide-react';
import { schedulingApi } from '../infra/schedulingApi';
import { getErrorMessage } from '../utils/errorMessage';

interface Appointment { id: string; barbershopId: string; serviceId: string; staffId?: string | null; customerName: string; date: string; time: string; status: string; service?: { name: string; avgTimeMinutes?: number } | null; staff?: { name: string } | null; barbershop?: { name: string; address?: string | null; city?: string | null } | null }
const isoDate = (value: string) => value.slice(0, 10);

const PublicAppointmentManagePage: React.FC = () => {
  const [appointment, setAppointment] = React.useState<Appointment | null>(null);
  const [sessionToken, setSessionToken] = React.useState<string | null>(null);
  const [date, setDate] = React.useState(''); const [time, setTime] = React.useState('');
  const [slots, setSlots] = React.useState<{ time: string; staffId: string | null }[]>([]);
  const [loading, setLoading] = React.useState(true); const [working, setWorking] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null); const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const token = window.location.hash.replace(/^#token=/, '');
    if (!token) { setError('Link de gerenciamento ausente ou inválido.'); setLoading(false); return; }
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    schedulingApi.exchangePublicAppointmentToken(token).then(result => { const data = result.appointment as Appointment; setAppointment(data); setSessionToken(result.sessionToken); setDate(isoDate(data.date)); setTime(data.time); }).catch(err => setError(getErrorMessage(err, 'Não foi possível abrir este agendamento.'))).finally(() => setLoading(false));
  }, []);

  React.useEffect(() => { if (!appointment || !date) return; schedulingApi.getAppointmentSlots(appointment.barbershopId, appointment.serviceId, date, appointment.staffId ?? undefined).then(setSlots).catch(() => setSlots([])); }, [appointment, date]);

  const cancel = async () => { if (!sessionToken) return; setWorking(true); setError(null); try { await schedulingApi.cancelPublicAppointment(sessionToken); setAppointment(current => current ? { ...current, status: 'CANCELLED' } : current); setMessage('Agendamento cancelado.'); } catch (err) { setError(getErrorMessage(err, 'Não foi possível cancelar este agendamento.')); } finally { setWorking(false); } };
  const reschedule = async () => { if (!sessionToken || !date || !time) return; setWorking(true); setError(null); try { const result = await schedulingApi.reschedulePublicAppointment(sessionToken, date, time); setAppointment(result.appointment as Appointment); const exchanged = await schedulingApi.exchangePublicAppointmentToken(result.manageToken); setSessionToken(exchanged.sessionToken); setMessage('Agendamento remarcado com sucesso.'); } catch (err) { setError(getErrorMessage(err, 'Não foi possível remarcar. Escolha outro horário.')); } finally { setWorking(false); } };

  if (loading) return <main className="min-h-screen bg-bg flex items-center justify-center text-accent"><Loader2 className="animate-spin" /></main>;
  return <main className="min-h-screen bg-bg text-text-primary px-4 py-8"><section className="max-w-lg mx-auto bg-surface border border-border rounded-2xl p-6 shadow-xl"><div className="flex items-center gap-3 mb-6"><Calendar className="text-accent" /><div><h1 className="text-xl font-bold">Gerenciar agendamento</h1><p className="text-sm text-text-secondary">Altere ou cancele seu horário.</p></div></div>{error && <p className="mb-4 rounded-xl bg-danger/10 border border-danger/30 text-danger p-3 text-sm">{error}</p>}{message && <p className="mb-4 rounded-xl bg-success/10 border border-success/30 text-success p-3 text-sm flex gap-2"><CheckCircle size={18} />{message}</p>}{appointment && <><div className="rounded-xl bg-bg border border-border p-4 space-y-1 mb-5"><p className="font-bold">{appointment.barbershop?.name}</p><p className="text-sm">{appointment.service?.name} · {appointment.staff?.name ?? 'Profissional disponível'}</p><p className="text-sm text-text-secondary">Cliente: {appointment.customerName}</p><p className="text-sm text-text-secondary">Status: {appointment.status === 'CANCELLED' ? 'Cancelado' : `${isoDate(appointment.date)} às ${appointment.time}`}</p></div>{appointment.status === 'CONFIRMED' && <><label className="block text-sm font-medium mb-1">Nova data<input type="date" value={date} onChange={event => { setDate(event.target.value); setTime(''); }} className="mt-1 w-full rounded-xl bg-bg border border-border p-3 text-text-primary" /></label><p className="text-sm font-medium mt-4 mb-2">Escolha um horário</p><div className="grid grid-cols-3 gap-2 max-h-48 overflow-auto">{slots.map(slot => <button key={slot.time} type="button" onClick={() => setTime(slot.time)} className={`rounded-lg border p-2 text-sm ${time === slot.time ? 'border-accent bg-accent/15 text-accent' : 'border-border bg-bg'}`}>{slot.time}</button>)}</div><div className="grid sm:grid-cols-2 gap-3 mt-5"><button type="button" disabled={working || !time} onClick={() => void reschedule()} className="rounded-xl bg-accent text-accent-fg p-3 font-bold disabled:opacity-50">{working ? 'Salvando...' : 'Remarcar horário'}</button><button type="button" disabled={working} onClick={() => void cancel()} className="rounded-xl border border-danger/40 text-danger p-3 font-bold disabled:opacity-50"><XCircle size={16} className="inline mr-2" />Cancelar agendamento</button></div></>}</>}</section></main>;
};
export default PublicAppointmentManagePage;
