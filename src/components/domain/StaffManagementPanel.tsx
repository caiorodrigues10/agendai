import React, { useCallback, useEffect, useState } from 'react';
import {
  Plus,
  Loader2,
  Trash2,
  Calendar,
  Clock,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { staffApi, StaffScheduleEntry, StaffService, TimeOffRequest } from '../../infra/staffApi';
import { useBarbershopFilters } from '../../contexts/BarbershopFiltersContext';
import { useBarbershop } from '../../contexts/BarbershopContext';
import { getErrorMessage } from '../../utils/errorMessage';
import { Field, FIELD_CONTROL, FORM_FOOTER } from '../ui/Field';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DAY_LABELS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-warning/15 text-warning',
  APPROVED: 'bg-success/15 text-success',
  REJECTED: 'bg-error/15 text-error',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
};

export const StaffManagementPanel: React.FC = () => {
  const { barbershopId } = useBarbershopFilters();
  const { staff } = useBarbershop();

  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [tab, setTab] = useState<'schedule' | 'services' | 'timeoff'>('schedule');

  // Schedule
  const [schedules, setSchedules] = useState<StaffScheduleEntry[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [newDayOfWeek, setNewDayOfWeek] = useState(1);
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('18:00');
  const [newBreakStart, setNewBreakStart] = useState('');
  const [newBreakEnd, setNewBreakEnd] = useState('');
  const [addingSchedule, setAddingSchedule] = useState(false);

  // Services
  const [assignedServices, setAssignedServices] = useState<StaffService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [showAssignService, setShowAssignService] = useState(false);
  const [assignServiceId, setAssignServiceId] = useState('');
  const [assignCustomPrice, setAssignCustomPrice] = useState('');
  const [assignCustomDuration, setAssignCustomDuration] = useState('');
  const [assigningService, setAssigningService] = useState(false);

  // Time-off
  const [timeOffs, setTimeOffs] = useState<TimeOffRequest[]>([]);
  const [timeOffLoading, setTimeOffLoading] = useState(false);
  const [showRequestTimeOff, setShowRequestTimeOff] = useState(false);
  const [timeOffStart, setTimeOffStart] = useState('');
  const [timeOffEnd, setTimeOffEnd] = useState('');
  const [timeOffReason, setTimeOffReason] = useState('');
  const [requestingTimeOff, setRequestingTimeOff] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (staff.length > 0 && !selectedStaffId) {
      setSelectedStaffId(staff[0].id);
    }
  }, [staff, selectedStaffId]);

  const loadSchedules = useCallback(async () => {
    if (!barbershopId || !selectedStaffId) return;
    setScheduleLoading(true);
    try {
      const data = await staffApi.getSchedules(barbershopId, selectedStaffId);
      setSchedules(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setScheduleLoading(false);
    }
  }, [barbershopId, selectedStaffId]);

  const loadServices = useCallback(async () => {
    if (!barbershopId || !selectedStaffId) return;
    setServicesLoading(true);
    try {
      const data = await staffApi.getAssignedServices(barbershopId, selectedStaffId);
      setAssignedServices(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setServicesLoading(false);
    }
  }, [barbershopId, selectedStaffId]);

  const loadTimeOffs = useCallback(async () => {
    if (!barbershopId || !selectedStaffId) return;
    setTimeOffLoading(true);
    try {
      const data = await staffApi.listTimeOff(barbershopId, selectedStaffId);
      setTimeOffs(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setTimeOffLoading(false);
    }
  }, [barbershopId, selectedStaffId]);

  useEffect(() => {
    if (selectedStaffId) {
      if (tab === 'schedule') loadSchedules();
      if (tab === 'services') loadServices();
      if (tab === 'timeoff') loadTimeOffs();
    }
  }, [selectedStaffId, tab, loadSchedules, loadServices, loadTimeOffs]);

  const handleAddSchedule = async () => {
    if (!barbershopId || !selectedStaffId) return;
    setAddingSchedule(true);
    setError(null);
    try {
      const entry = await staffApi.upsertSchedule(barbershopId, selectedStaffId, {
        dayOfWeek: newDayOfWeek,
        startTime: newStartTime,
        endTime: newEndTime,
        breakStart: newBreakStart || undefined,
        breakEnd: newBreakEnd || undefined,
      });
      setSchedules(prev => {
        const filtered = prev.filter(s => s.dayOfWeek !== entry.dayOfWeek);
        return [...filtered, entry].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
      });
      setShowAddSchedule(false);
      setNewBreakStart('');
      setNewBreakEnd('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setAddingSchedule(false);
    }
  };

  const handleRemoveSchedule = async (scheduleId: string) => {
    if (!barbershopId || !selectedStaffId) return;
    try {
      await staffApi.removeSchedule(barbershopId, selectedStaffId, scheduleId);
      setSchedules(prev => prev.filter(s => s.id !== scheduleId));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleAssignService = async () => {
    if (!barbershopId || !selectedStaffId || !assignServiceId) return;
    setAssigningService(true);
    setError(null);
    try {
      const svc = await staffApi.assignService(barbershopId, selectedStaffId, {
        serviceId: assignServiceId,
        customPrice: assignCustomPrice ? parseFloat(assignCustomPrice) : undefined,
        customDuration: assignCustomDuration ? parseInt(assignCustomDuration, 10) : undefined,
      });
      setAssignedServices(prev => [...prev, svc]);
      setShowAssignService(false);
      setAssignServiceId('');
      setAssignCustomPrice('');
      setAssignCustomDuration('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setAssigningService(false);
    }
  };

  const handleRemoveService = async (serviceId: string) => {
    if (!barbershopId || !selectedStaffId) return;
    try {
      await staffApi.removeService(barbershopId, selectedStaffId, serviceId);
      setAssignedServices(prev => prev.filter(s => s.serviceId !== serviceId));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleRequestTimeOff = async () => {
    if (!barbershopId || !selectedStaffId || !timeOffStart || !timeOffEnd) return;
    setRequestingTimeOff(true);
    setError(null);
    try {
      const req = await staffApi.requestTimeOff(barbershopId, selectedStaffId, {
        startDate: timeOffStart,
        endDate: timeOffEnd,
        reason: timeOffReason.trim() || undefined,
      });
      setTimeOffs(prev => [req, ...prev]);
      setShowRequestTimeOff(false);
      setTimeOffStart('');
      setTimeOffEnd('');
      setTimeOffReason('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRequestingTimeOff(false);
    }
  };

  const handleApproveTimeOff = async (requestId: string) => {
    if (!barbershopId || !selectedStaffId) return;
    try {
      const updated = await staffApi.approveTimeOff(barbershopId, selectedStaffId, requestId);
      setTimeOffs(prev => prev.map(r => (r.id === requestId ? updated : r)));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleRejectTimeOff = async (requestId: string) => {
    if (!barbershopId || !selectedStaffId) return;
    try {
      const updated = await staffApi.rejectTimeOff(barbershopId, selectedStaffId, requestId);
      setTimeOffs(prev => prev.map(r => (r.id === requestId ? updated : r)));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR');

  const { services } = useBarbershop();
  const availableServices = services.filter(
    s => !assignedServices.some(as => as.serviceId === s.id)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-text-primary">Equipe</h3>
      </div>

      {error && <p className="text-xs text-error">{error}</p>}

      {/* Staff selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {staff.map(s => (
          <button
            key={s.id}
            onClick={() => setSelectedStaffId(s.id)}
            className={`rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap transition ${
              selectedStaffId === s.id
                ? 'bg-accent text-accent-fg'
                : 'bg-surface text-text-secondary hover:bg-surface-2'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {!selectedStaffId ? (
        <p className="text-sm text-text-muted py-8 text-center">Selecione um membro da equipe.</p>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-2 border-b border-border pb-2">
            {([
              { key: 'schedule', label: 'Horários', icon: Clock },
              { key: 'services', label: 'Serviços', icon: Check },
              { key: 'timeoff', label: 'Folgas', icon: Calendar },
            ] as const).map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  tab === t.key
                    ? 'bg-accent text-accent-fg'
                    : 'bg-surface text-text-secondary hover:bg-surface-2'
                }`}
              >
                <t.icon size={12} />
                {t.label}
              </button>
            ))}
          </div>

          {/* SCHEDULE TAB */}
          {tab === 'schedule' && (
            <div className="space-y-3">
              {scheduleLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin text-accent" size={20} />
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-2">
                  {DAYS.map((day, idx) => {
                    const entry = schedules.find(s => s.dayOfWeek === idx);
                    return (
                      <div
                        key={idx}
                        className={`rounded-xl border p-2 text-center text-xs ${
                          entry?.isActive
                            ? 'border-accent bg-accent/5'
                            : entry
                            ? 'border-border bg-surface-2'
                            : 'border-dashed border-border bg-bg'
                        }`}
                      >
                        <p className="font-bold text-text-secondary mb-1">{day}</p>
                        {entry ? (
                          <div className="space-y-0.5">
                            <p className="text-text-primary font-medium">{entry.startTime}-{entry.endTime}</p>
                            {entry.breakStart && entry.breakEnd && (
                              <p className="text-text-muted text-[10px]">Almoço {entry.breakStart}-{entry.breakEnd}</p>
                            )}
                            <button
                              onClick={() => void handleRemoveSchedule(entry.id)}
                              className="text-error hover:underline text-[10px]"
                            >
                              Remover
                            </button>
                          </div>
                        ) : (
                          <p className="text-text-muted">Folga</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {showAddSchedule ? (
                <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
                  <h4 className="text-xs font-bold text-text-secondary">Adicionar horário</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Dia da semana">
                      <select
                        value={newDayOfWeek}
                        onChange={e => setNewDayOfWeek(parseInt(e.target.value))}
                        className={FIELD_CONTROL}
                      >
                        {DAY_LABELS.map((label, idx) => (
                          <option key={idx} value={idx}>{label}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Início">
                      <input
                        type="time"
                        value={newStartTime}
                        onChange={e => setNewStartTime(e.target.value)}
                        className={FIELD_CONTROL}
                      />
                    </Field>
                    <Field label="Fim">
                      <input
                        type="time"
                        value={newEndTime}
                        onChange={e => setNewEndTime(e.target.value)}
                        className={FIELD_CONTROL}
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Início almoço (opcional)">
                      <input
                        type="time"
                        value={newBreakStart}
                        onChange={e => setNewBreakStart(e.target.value)}
                        className={FIELD_CONTROL}
                      />
                    </Field>
                    <Field label="Fim almoço (opcional)">
                      <input
                        type="time"
                        value={newBreakEnd}
                        onChange={e => setNewBreakEnd(e.target.value)}
                        className={FIELD_CONTROL}
                      />
                    </Field>
                  </div>
                  <div className={FORM_FOOTER}>
                    <button
                      onClick={() => void handleAddSchedule()}
                      disabled={addingSchedule}
                      className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-accent-fg disabled:opacity-50"
                    >
                      {addingSchedule ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
                      Salvar
                    </button>
                    <button
                      onClick={() => setShowAddSchedule(false)}
                      className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-text-secondary hover:bg-surface-2"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddSchedule(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-dashed border-border px-4 py-2.5 text-xs font-bold text-text-muted hover:bg-surface-2"
                >
                  <Plus size={14} />
                  Adicionar horário
                </button>
              )}
            </div>
          )}

          {/* SERVICES TAB */}
          {tab === 'services' && (
            <div className="space-y-3">
              {servicesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin text-accent" size={20} />
                </div>
              ) : assignedServices.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
                  <p className="text-sm text-text-secondary">Nenhum serviço atribuído.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {assignedServices.map(svc => (
                    <div
                      key={svc.serviceId}
                      className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-text-primary">{svc.serviceName || svc.serviceId}</p>
                        <p className="text-xs text-text-muted">
                          {svc.customPrice ? `R$ ${svc.customPrice.toFixed(2)}` : 'Preço padrão'}
                          {svc.customDuration ? ` · ${svc.customDuration} min` : ''}
                        </p>
                      </div>
                      <button
                        onClick={() => void handleRemoveService(svc.serviceId)}
                        className="rounded-lg p-2 text-text-muted hover:bg-error/10 hover:text-error"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {showAssignService ? (
                <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
                  <h4 className="text-xs font-bold text-text-secondary">Atribuir serviço</h4>
                  <Field label="Serviço *">
                    <select
                      value={assignServiceId}
                      onChange={e => setAssignServiceId(e.target.value)}
                      className={FIELD_CONTROL}
                    >
                      <option value="">Selecione...</option>
                      {availableServices.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Preço personalizado (opcional)">
                      <input
                        type="number"
                        placeholder="0.00"
                        value={assignCustomPrice}
                        onChange={e => setAssignCustomPrice(e.target.value)}
                        className={FIELD_CONTROL}
                      />
                    </Field>
                    <Field label="Duração personalizada min (opcional)">
                      <input
                        type="number"
                        placeholder="Minutos"
                        value={assignCustomDuration}
                        onChange={e => setAssignCustomDuration(e.target.value)}
                        className={FIELD_CONTROL}
                      />
                    </Field>
                  </div>
                  <div className={FORM_FOOTER}>
                    <button
                      onClick={() => void handleAssignService()}
                      disabled={assigningService || !assignServiceId}
                      className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-accent-fg disabled:opacity-50"
                    >
                      {assigningService ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
                      Atribuir
                    </button>
                    <button
                      onClick={() => setShowAssignService(false)}
                      className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-text-secondary hover:bg-surface-2"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAssignService(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-dashed border-border px-4 py-2.5 text-xs font-bold text-text-muted hover:bg-surface-2"
                >
                  <Plus size={14} />
                  Atribuir serviço
                </button>
              )}
            </div>
          )}

          {/* TIME-OFF TAB */}
          {tab === 'timeoff' && (
            <div className="space-y-3">
              {timeOffLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin text-accent" size={20} />
                </div>
              ) : timeOffs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
                  <p className="text-sm text-text-secondary">Nenhuma solicitação de folga.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {timeOffs.map(req => (
                    <div
                      key={req.id}
                      className="rounded-2xl border border-border bg-surface p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-text-primary">
                            {formatDate(req.startDate)} — {formatDate(req.endDate)}
                          </p>
                          {req.reason && <p className="text-xs text-text-muted">{req.reason}</p>}
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_COLORS[req.status] || ''}`}>
                          {STATUS_LABELS[req.status] || req.status}
                        </span>
                      </div>
                      {req.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => void handleApproveTimeOff(req.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-success/10 px-3 py-1.5 text-[10px] font-bold text-success hover:bg-success/20"
                          >
                            <Check size={10} />
                            Aprovar
                          </button>
                          <button
                            onClick={() => void handleRejectTimeOff(req.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-error/10 px-3 py-1.5 text-[10px] font-bold text-error hover:bg-error/20"
                          >
                            <X size={10} />
                            Rejeitar
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {showRequestTimeOff ? (
                <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
                  <h4 className="text-xs font-bold text-text-secondary">Solicitar folga</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Data início *">
                      <input
                        type="date"
                        value={timeOffStart}
                        onChange={e => setTimeOffStart(e.target.value)}
                        className={FIELD_CONTROL}
                      />
                    </Field>
                    <Field label="Data fim *">
                      <input
                        type="date"
                        value={timeOffEnd}
                        onChange={e => setTimeOffEnd(e.target.value)}
                        className={FIELD_CONTROL}
                      />
                    </Field>
                  </div>
                  <Field label="Motivo (opcional)">
                    <input
                      type="text"
                      placeholder="Motivo da folga"
                      value={timeOffReason}
                      onChange={e => setTimeOffReason(e.target.value)}
                      className={FIELD_CONTROL}
                    />
                  </Field>
                  <div className={FORM_FOOTER}>
                    <button
                      onClick={() => void handleRequestTimeOff()}
                      disabled={requestingTimeOff || !timeOffStart || !timeOffEnd}
                      className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-accent-fg disabled:opacity-50"
                    >
                      {requestingTimeOff ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
                      Solicitar
                    </button>
                    <button
                      onClick={() => setShowRequestTimeOff(false)}
                      className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-text-secondary hover:bg-surface-2"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowRequestTimeOff(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-dashed border-border px-4 py-2.5 text-xs font-bold text-text-muted hover:bg-surface-2"
                >
                  <Plus size={14} />
                  Solicitar folga
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
