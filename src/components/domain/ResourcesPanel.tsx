import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, Plus, Trash2, Edit3, Calendar, Clock, XCircle } from 'lucide-react';
import { useBarbershopFilters } from '../../contexts/BarbershopFiltersContext';
import { resourcesApi, Resource, ResourceBooking } from '../../infra/resourcesApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { formatDateBR } from '../../utils/formatters';
import { Field, FIELD_CONTROL, FORM_FOOTER, FORM_GRID } from '../ui/Field';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { EmptyState } from '../ui/EmptyState';

const TYPE_LABELS: Record<string, string> = {
  ROOM: 'Sala',
  CHAIR: 'Cadeira',
  EQUIPMENT: 'Equipamento',
  VEHICLE: 'Veículo',
  OTHER: 'Outro',
};

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: 'bg-green-500/10 text-green-400 border-green-500/30',
  CANCELED: 'bg-red-500/10 text-red-400 border-red-500/30',
  COMPLETED: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
};

const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: 'Confirmado',
  CANCELED: 'Cancelado',
  COMPLETED: 'Concluído',
};

interface ResourceFormData {
  name: string;
  type: string;
  description: string;
  maxConcurrent: number;
}

const INITIAL_FORM: ResourceFormData = {
  name: '',
  type: 'CHAIR',
  description: '',
  maxConcurrent: 1,
};

interface BookingFormData {
  resourceId: string;
  startAt: string;
  endTime: string;
  notes: string;
}

const INITIAL_BOOKING_FORM: BookingFormData = {
  resourceId: '',
  startAt: '',
  endTime: '',
  notes: '',
};

export const ResourcesPanel: React.FC = () => {
  const { barbershopId } = useBarbershopFilters();
  const [resources, setResources] = useState<Resource[]>([]);
  const [bookings, setBookings] = useState<ResourceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [form, setForm] = useState<ResourceFormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Resource | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState<BookingFormData>(INITIAL_BOOKING_FORM);
  const [bookingSubmitError, setBookingSubmitError] = useState<string | null>(null);
  const [cancelBookingTarget, setCancelBookingTarget] = useState<ResourceBooking | null>(null);

  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [activeTab, setActiveTab] = useState<'resources' | 'bookings'>('resources');

  const loadResources = useCallback(async () => {
    if (!barbershopId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await resourcesApi.list(barbershopId);
      setResources(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao carregar recursos'));
    } finally {
      setLoading(false);
    }
  }, [barbershopId]);

  const loadBookings = useCallback(async () => {
    if (!barbershopId || !dateRange.from || !dateRange.to) return;
    try {
      const data = await resourcesApi.listBookings(barbershopId, {
        dateFrom: dateRange.from,
        dateTo: dateRange.to,
      });
      setBookings(data);
    } catch (err) {
      console.error('Failed to load bookings', err);
    }
  }, [barbershopId, dateRange.from, dateRange.to]);

  useEffect(() => { loadResources(); }, [loadResources]);
  useEffect(() => { loadBookings(); }, [loadBookings]);

  const openCreate = () => {
    setEditingResource(null);
    setForm(INITIAL_FORM);
    setSubmitError(null);
    setModalOpen(true);
  };

  const openEdit = (resource: Resource) => {
    setEditingResource(resource);
    setForm({
      name: resource.name,
      type: resource.type,
      description: resource.description ?? '',
      maxConcurrent: resource.maxConcurrent,
    });
    setSubmitError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barbershopId) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (editingResource) {
        await resourcesApi.update(barbershopId, editingResource.id, form);
      } else {
        await resourcesApi.create(barbershopId, form);
      }
      setModalOpen(false);
      await loadResources();
    } catch (err) {
      setSubmitError(getErrorMessage(err, 'Erro ao salvar recurso'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!barbershopId || !deleteTarget) return;
    setDeleting(true);
    try {
      await resourcesApi.remove(barbershopId, deleteTarget.id);
      setDeleteTarget(null);
      await loadResources();
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao remover recurso'));
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barbershopId) return;
    setBookingSubmitError(null);
    try {
      await resourcesApi.createBooking(barbershopId, bookingForm);
      setBookingModalOpen(false);
      await loadBookings();
    } catch (err) {
      setBookingSubmitError(getErrorMessage(err, 'Erro ao criar reserva'));
    }
  };

  const handleCancelBooking = async () => {
    if (!barbershopId || !cancelBookingTarget) return;
    try {
      await resourcesApi.cancelBooking(barbershopId, cancelBookingTarget.id);
      setCancelBookingTarget(null);
      await loadBookings();
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao cancelar reserva'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recursos</h2>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Novo Recurso
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Tab selector */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        <button
          onClick={() => setActiveTab('resources')}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            activeTab === 'resources'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Recursos
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            activeTab === 'bookings'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Reservas
        </button>
      </div>

      {activeTab === 'resources' && (
        <>
          {resources.length === 0 ? (
            <EmptyState
              title="Nenhum recurso cadastrado"
              description="Cadastre salas, cadeiras, equipamentos ou veículos para agendar junto com os horários."
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {resources.map((resource) => (
                <div
                  key={resource.id}
                  className="rounded-lg border border-border bg-card p-4 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{resource.name}</h3>
                      <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {TYPE_LABELS[resource.type] ?? resource.type}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(resource)}
                        className="rounded p-1 hover:bg-muted"
                        title="Editar"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(resource)}
                        className="rounded p-1 text-red-400 hover:bg-red-500/10"
                        title="Remover"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {resource.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{resource.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Capacidade: {resource.maxConcurrent}</span>
                    <span
                      className={resource.isActive ? 'text-green-400' : 'text-red-400'}
                    >
                      {resource.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'bookings' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange((p) => ({ ...p, from: e.target.value }))}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
            />
            <span className="text-muted-foreground">até</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange((p) => ({ ...p, to: e.target.value }))}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
            />
            <button
              onClick={() => {
                setBookingForm(INITIAL_BOOKING_FORM);
                setBookingSubmitError(null);
                setBookingModalOpen(true);
              }}
              className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Nova Reserva
            </button>
          </div>

          {bookings.length === 0 ? (
            <EmptyState
              title="Nenhuma reserva no período"
              description="Selecione um período para ver as reservas."
            />
          ) : (
            <div className="space-y-2">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{booking.resource?.name ?? 'Recurso'}</span>
                      <span
                        className={`inline-block rounded-full border px-2 py-0.5 text-xs ${
                          STATUS_STYLES[booking.status] ?? ''
                        }`}
                      >
                        {STATUS_LABELS[booking.status] ?? booking.status}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(booking.startAt).toLocaleDateString('pt-BR')}{' '}
                      {new Date(booking.startAt).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      –{' '}
                      {new Date(booking.endTime).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    {booking.notes && (
                      <p className="text-xs text-muted-foreground">{booking.notes}</p>
                    )}
                  </div>
                  {booking.status === 'CONFIRMED' && (
                    <button
                      onClick={() => setCancelBookingTarget(booking)}
                      className="rounded p-1 text-red-400 hover:bg-red-500/10"
                      title="Cancelar reserva"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Resource create/edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold">
              {editingResource ? 'Editar Recurso' : 'Novo Recurso'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              {bookingSubmitError && (
                <div className="rounded-md bg-red-500/10 p-2 text-sm text-red-400">
                  {submitError}
                </div>
              )}
              <Field label="Nome">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className={FIELD_CONTROL}
                  required
                  maxLength={100}
                />
              </Field>
              <Field label="Tipo">
                <select
                  value={form.type}
                  onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                  className={FIELD_CONTROL}
                >
                  {Object.entries(TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Descrição">
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className={FIELD_CONTROL}
                  rows={2}
                  maxLength={500}
                />
              </Field>
              <Field label="Capacidade simultânea">
                <input
                  type="number"
                  value={form.maxConcurrent}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, maxConcurrent: Number(e.target.value) }))
                  }
                  className={FIELD_CONTROL}
                  min={1}
                  max={100}
                />
              </Field>
              <div className={FORM_FOOTER}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingResource ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking create modal */}
      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold">Nova Reserva</h3>
            <form onSubmit={handleCreateBooking} className="space-y-3">
              {bookingSubmitError && (
                <div className="rounded-md bg-red-500/10 p-2 text-sm text-red-400">
                  {bookingSubmitError}
                </div>
              )}
              <Field label="Recurso">
                <select
                  value={bookingForm.resourceId}
                  onChange={(e) => setBookingForm((p) => ({ ...p, resourceId: e.target.value }))}
                  className={FIELD_CONTROL}
                  required
                >
                  <option value="">Selecione...</option>
                  {resources.filter((r) => r.isActive).map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({TYPE_LABELS[r.type] ?? r.type})
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Início">
                <input
                  type="datetime-local"
                  value={bookingForm.startAt}
                  onChange={(e) => setBookingForm((p) => ({ ...p, startAt: e.target.value }))}
                  className={FIELD_CONTROL}
                  required
                />
              </Field>
              <Field label="Término">
                <input
                  type="datetime-local"
                  value={bookingForm.endTime}
                  onChange={(e) => setBookingForm((p) => ({ ...p, endTime: e.target.value }))}
                  className={FIELD_CONTROL}
                  required
                />
              </Field>
              <Field label="Observações">
                <textarea
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm((p) => ({ ...p, notes: e.target.value }))}
                  className={FIELD_CONTROL}
                  rows={2}
                  maxLength={500}
                />
              </Field>
              <div className={FORM_FOOTER}>
                <button
                  type="button"
                  onClick={() => setBookingModalOpen(false)}
                  className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Criar Reserva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete resource confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        title="Remover recurso"
        message={`Tem certeza que deseja remover "${deleteTarget?.name}"? Todas as reservas associadas serão canceladas.`}
        onConfirm={handleDelete}
        loading={deleting}
        confirmLabel="Remover"
        variant="danger"
      />

      {/* Cancel booking confirmation */}
      <ConfirmDialog
        open={!!cancelBookingTarget}
        onCancel={() => setCancelBookingTarget(null)}
        title="Cancelar reserva"
        message="Tem certeza que deseja cancelar esta reserva?"
        onConfirm={handleCancelBooking}
        confirmLabel="Cancelar Reserva"
        variant="danger"
      />
    </div>
  );
};
