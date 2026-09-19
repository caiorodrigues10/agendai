import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, Plus, Trash2, Edit3, Package, ArrowDownCircle, ArrowUpCircle, AlertTriangle, Wrench, Search as SearchIcon } from 'lucide-react';
import { useBarbershopFilters } from '../../contexts/BarbershopFiltersContext';
import { equipmentApi, Equipment, EquipmentMovement, EquipmentNeed } from '../../infra/equipmentApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { Field, FIELD_CONTROL, FORM_FOOTER, FORM_GRID } from '../ui/Field';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { EmptyState } from '../ui/EmptyState';
import { SmartSelect } from '../ui/SmartSelect';

type HubTab = 'estoque' | 'movimentacoes' | 'necessidades';

const CATEGORY_LABELS: Record<string, string> = {
  BARBER_TOOLS: 'Maquinas',
  BEARD_TOOLS: 'Barba',
  AESTHETICS: 'Estetica',
  FURNITURE: 'Mobilia',
  CLEANING: 'Limpeza',
  OTHER: 'Outros',
};

const CONDITION_LABELS: Record<string, string> = {
  NEW: 'Novo',
  GOOD: 'Bom',
  WORN: 'Desgastado',
  BROKEN: 'Quebrado',
  IN_MAINTENANCE: 'Manutencao',
};

const CONDITION_STYLES: Record<string, string> = {
  NEW: 'border-success/30 bg-success/10 text-success',
  GOOD: 'border-accent/30 bg-accent/10 text-accent',
  WORN: 'border-warning/30 bg-warning/10 text-warning',
  BROKEN: 'border-danger/30 bg-danger/10 text-danger',
  IN_MAINTENANCE: 'border-blue-400/30 bg-blue-400/10 text-blue-400',
};

const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  IN: 'Entrada',
  OUT: 'Saida',
  MAINTENANCE: 'Manutencao',
  LOSS: 'Perda',
  ADJUSTMENT: 'Ajuste',
};

const MOVEMENT_TYPE_ICONS: Record<string, React.ReactNode> = {
  IN: <ArrowDownCircle className="h-4 w-4 text-success" />,
  OUT: <ArrowUpCircle className="h-4 w-4 text-danger" />,
  MAINTENANCE: <Wrench className="h-4 w-4 text-blue-400" />,
  LOSS: <Trash2 className="h-4 w-4 text-red-400" />,
  ADJUSTMENT: <Edit3 className="h-4 w-4 text-text-muted" />,
};

const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

const PRIORITY_STYLES: Record<string, string> = {
  LOW: 'border-border bg-surface-2 text-text-secondary',
  MEDIUM: 'border-accent/30 bg-accent/10 text-accent',
  HIGH: 'border-warning/30 bg-warning/10 text-warning',
  URGENT: 'border-danger/30 bg-danger/10 text-danger',
};

const STATUS_LABELS: Record<string, string> = {
  REQUESTED: 'Solicitado',
  APPROVED: 'Aprovado',
  ORDERED: 'Pedindo',
  RECEIVED: 'Recebido',
  REJECTED: 'Rejeitado',
};

const STATUS_STYLES: Record<string, string> = {
  REQUESTED: 'border-accent/30 bg-accent/10 text-accent',
  APPROVED: 'border-success/30 bg-success/10 text-success',
  ORDERED: 'border-blue-400/30 bg-blue-400/10 text-blue-400',
  RECEIVED: 'border-success/30 bg-success/10 text-success',
  REJECTED: 'border-danger/30 bg-danger/10 text-danger',
};

// ─── Equipment form ─────────────────────────────────────────

interface EquipmentFormData {
  name: string;
  category: string;
  brand: string;
  model: string;
  serialNumber: string;
  quantityTotal: number;
  quantityAvailable: number;
  condition: string;
  minQuantity: number;
  unitCost: string;
  supplier: string;
  notes: string;
}

const INITIAL_EQUIP_FORM: EquipmentFormData = {
  name: '',
  category: 'OTHER',
  brand: '',
  model: '',
  serialNumber: '',
  quantityTotal: 1,
  quantityAvailable: 1,
  condition: 'NEW',
  minQuantity: 0,
  unitCost: '',
  supplier: '',
  notes: '',
};

// ─── Movement form ──────────────────────────────────────────

interface MovementFormData {
  equipmentId: string;
  type: string;
  quantity: number;
  reason: string;
}

const INITIAL_MOVEMENT_FORM: MovementFormData = {
  equipmentId: '',
  type: 'IN',
  quantity: 1,
  reason: '',
};

// ─── Need form ──────────────────────────────────────────────

interface NeedFormData {
  equipmentId: string;
  name: string;
  quantityNeeded: number;
  priority: string;
  reason: string;
  estimatedCost: string;
}

const INITIAL_NEED_FORM: NeedFormData = {
  equipmentId: '',
  name: '',
  quantityNeeded: 1,
  priority: 'MEDIUM',
  reason: '',
  estimatedCost: '',
};

// ═══════════════════════════════════════════════════════════════

export const EquipmentPanel: React.FC = () => {
  const { barbershopId } = useBarbershopFilters();

  const [tab, setTab] = useState<HubTab>('estoque');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [movements, setMovements] = useState<EquipmentMovement[]>([]);
  const [needs, setNeeds] = useState<EquipmentNeed[]>([]);
  const [dashboard, setDashboard] = useState<Awaited<ReturnType<typeof equipmentApi.dashboard>> | null>(null);

  // Equipment modal
  const [equipModalOpen, setEquipModalOpen] = useState(false);
  const [editingEquip, setEditingEquip] = useState<Equipment | null>(null);
  const [equipForm, setEquipForm] = useState<EquipmentFormData>(INITIAL_EQUIP_FORM);
  const [equipSubmitting, setEquipSubmitting] = useState(false);
  const [equipSubmitError, setEquipSubmitError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Equipment | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Movement modal
  const [movModalOpen, setMovModalOpen] = useState(false);
  const [movForm, setMovForm] = useState<MovementFormData>(INITIAL_MOVEMENT_FORM);
  const [movSubmitError, setMovSubmitError] = useState<string | null>(null);
  const [movSubmitting, setMovSubmitting] = useState(false);

  // Need modal
  const [needModalOpen, setNeedModalOpen] = useState(false);
  const [needForm, setNeedForm] = useState<NeedFormData>(INITIAL_NEED_FORM);
  const [needSubmitError, setNeedSubmitError] = useState<string | null>(null);
  const [needSubmitting, setNeedSubmitting] = useState(false);

  // Search
  const [search, setSearch] = useState('');

  const categoryOptions = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }));
  const conditionOptions = Object.entries(CONDITION_LABELS).map(([value, label]) => ({ value, label }));
  const movementTypeOptions = Object.entries(MOVEMENT_TYPE_LABELS).map(([value, label]) => ({ value, label }));
  const priorityOptions = Object.entries(PRIORITY_LABELS).map(([value, label]) => ({ value, label }));
  const equipSelectOptions = equipment.filter(e => e.isActive).map(e => ({ value: e.id, label: e.name, description: CATEGORY_LABELS[e.category] ?? e.category }));

  // ─── Loaders ──────────────────────────────────────────────

  const loadEquipment = useCallback(async () => {
    if (!barbershopId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await equipmentApi.list(barbershopId);
      setEquipment(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao carregar equipamentos'));
    } finally {
      setLoading(false);
    }
  }, [barbershopId]);

  const loadMovements = useCallback(async () => {
    if (!barbershopId) return;
    try {
      const data = await equipmentApi.listMovements(barbershopId);
      setMovements(data);
    } catch (err) {
      console.error('Failed to load movements', err);
    }
  }, [barbershopId]);

  const loadNeeds = useCallback(async () => {
    if (!barbershopId) return;
    try {
      const data = await equipmentApi.listNeeds(barbershopId);
      setNeeds(data);
    } catch (err) {
      console.error('Failed to load needs', err);
    }
  }, [barbershopId]);

  const loadDashboard = useCallback(async () => {
    if (!barbershopId) return;
    try {
      const data = await equipmentApi.dashboard(barbershopId);
      setDashboard(data);
    } catch (err) {
      console.error('Failed to load dashboard', err);
    }
  }, [barbershopId]);

  useEffect(() => { loadEquipment(); }, [loadEquipment]);
  useEffect(() => { if (tab === 'movimentacoes') loadMovements(); }, [tab, loadMovements]);
  useEffect(() => { if (tab === 'necessidades') loadNeeds(); }, [tab, loadNeeds]);
  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  // ─── Equipment handlers ──────────────────────────────────

  const openCreateEquip = () => {
    setEditingEquip(null);
    setEquipForm(INITIAL_EQUIP_FORM);
    setEquipSubmitError(null);
    setEquipModalOpen(true);
  };

  const openEditEquip = (equip: Equipment) => {
    setEditingEquip(equip);
    setEquipForm({
      name: equip.name,
      category: equip.category,
      brand: equip.brand ?? '',
      model: equip.model ?? '',
      serialNumber: equip.serialNumber ?? '',
      quantityTotal: equip.quantityTotal,
      quantityAvailable: equip.quantityAvailable,
      condition: equip.condition,
      minQuantity: equip.minQuantity,
      unitCost: equip.unitCost != null ? String(equip.unitCost) : '',
      supplier: equip.supplier ?? '',
      notes: equip.notes ?? '',
    });
    setEquipSubmitError(null);
    setEquipModalOpen(true);
  };

  const handleEquipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barbershopId) return;
    setEquipSubmitting(true);
    setEquipSubmitError(null);
    try {
      const payload = {
        ...equipForm,
        unitCost: equipForm.unitCost ? Number(equipForm.unitCost) : undefined,
      };
      if (editingEquip) {
        await equipmentApi.update(barbershopId, editingEquip.id, payload as any);
      } else {
        await equipmentApi.create(barbershopId, payload as any);
      }
      setEquipModalOpen(false);
      await loadEquipment();
      await loadDashboard();
    } catch (err) {
      setEquipSubmitError(getErrorMessage(err, 'Erro ao salvar equipamento'));
    } finally {
      setEquipSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!barbershopId || !deleteTarget) return;
    setDeleting(true);
    try {
      await equipmentApi.remove(barbershopId, deleteTarget.id);
      setDeleteTarget(null);
      await loadEquipment();
      await loadDashboard();
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao remover equipamento'));
    } finally {
      setDeleting(false);
    }
  };

  // ─── Movement handlers ───────────────────────────────────

  const handleMovSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barbershopId) return;
    setMovSubmitting(true);
    setMovSubmitError(null);
    try {
      await equipmentApi.createMovement(barbershopId, movForm);
      setMovModalOpen(false);
      setMovForm(INITIAL_MOVEMENT_FORM);
      await loadMovements();
      await loadEquipment();
      await loadDashboard();
    } catch (err) {
      setMovSubmitError(getErrorMessage(err, 'Erro ao registrar movimentacao'));
    } finally {
      setMovSubmitting(false);
    }
  };

  // ─── Need handlers ───────────────────────────────────────

  const handleNeedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barbershopId) return;
    setNeedSubmitting(true);
    setNeedSubmitError(null);
    try {
      await equipmentApi.createNeed(barbershopId, {
        ...needForm,
        estimatedCost: needForm.estimatedCost ? Number(needForm.estimatedCost) : undefined,
      });
      setNeedModalOpen(false);
      setNeedForm(INITIAL_NEED_FORM);
      await loadNeeds();
      await loadDashboard();
    } catch (err) {
      setNeedSubmitError(getErrorMessage(err, 'Erro ao criar necessidade'));
    } finally {
      setNeedSubmitting(false);
    }
  };

  const handleUpdateNeedStatus = async (needId: string, status: string) => {
    if (!barbershopId) return;
    try {
      await equipmentApi.updateNeed(barbershopId, needId, { status });
      await loadNeeds();
      await loadDashboard();
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao atualizar necessidade'));
    }
  };

  // ─── Filtered equipment ──────────────────────────────────

  const filteredEquipment = equipment.filter(e => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      e.name.toLowerCase().includes(s) ||
      (e.brand && e.brand.toLowerCase().includes(s)) ||
      (e.model && e.model.toLowerCase().includes(s)) ||
      (e.serialNumber && e.serialNumber.toLowerCase().includes(s))
    );
  });

  // ─── Loading state ───────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════════

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-[0_18px_44px_-32px_rgba(0,0,0,0.7)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Controle de Estoque</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Gerencie equipamentos, movimentacoes e necessidades de compra.
            </p>
          </div>
          <button
            onClick={openCreateEquip}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-bold text-accent-fg shadow-lg shadow-accent/15 transition hover:bg-accent-hover"
          >
            <Plus className="h-4 w-4" />
            Novo equipamento
          </button>
        </div>

        {/* Dashboard summary cards */}
        {dashboard && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-border bg-bg p-3 text-center">
              <p className="text-2xl font-bold text-text-primary">{dashboard.totalEquipment}</p>
              <p className="text-xs text-text-muted">Total</p>
            </div>
            <div className="rounded-xl border border-border bg-bg p-3 text-center">
              <p className="text-2xl font-bold text-success">{dashboard.activeEquipment}</p>
              <p className="text-xs text-text-muted">Ativos</p>
            </div>
            <div className="rounded-xl border border-border bg-bg p-3 text-center">
              <p className={`text-2xl font-bold ${dashboard.lowStockCount > 0 ? 'text-warning' : 'text-text-muted'}`}>
                {dashboard.lowStockCount}
              </p>
              <p className="text-xs text-text-muted">Estoque baixo</p>
            </div>
            <div className="rounded-xl border border-border bg-bg p-3 text-center">
              <p className={`text-2xl font-bold ${dashboard.pendingNeeds > 0 ? 'text-accent' : 'text-text-muted'}`}>
                {dashboard.pendingNeeds}
              </p>
              <p className="text-xs text-text-muted">Necessidades</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          {error}
        </div>
      )}

      {/* Tab selector */}
      <div className="rounded-2xl border border-border bg-surface p-2 shadow-[0_18px_44px_-32px_rgba(0,0,0,0.7)]">
        <div className="grid grid-cols-3 gap-2">
          {([
            ['estoque', 'Estoque', <Package className="h-4 w-4" />],
            ['movimentacoes', 'Movimentacoes', <ArrowUpCircle className="h-4 w-4" />],
            ['necessidades', 'Necessidades', <AlertTriangle className="h-4 w-4" />],
          ] as const).map(([id, label, icon]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold transition-colors ${
                tab === id
                  ? 'bg-accent text-accent-fg shadow-md shadow-accent/15'
                  : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ Tab: Estoque ═══════════════════════════════════ */}
      {tab === 'estoque' && (
        <div className="space-y-3">
          {/* Search bar */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar equipamento..."
              className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-focus"
            />
          </div>

          {filteredEquipment.length === 0 ? (
            <EmptyState
              title="Nenhum equipamento cadastrado"
              description="Cadastre equipamentos para controlar estoque e movimentacoes."
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEquipment.map((equip) => (
                <div
                  key={equip.id}
                  className="rounded-xl border border-border bg-surface p-4 shadow-[0_16px_36px_-30px_rgba(0,0,0,0.75)] transition-colors hover:border-accent/40"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-text-primary">{equip.name}</h3>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <span className="inline-flex rounded-full border border-border bg-bg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-text-secondary">
                          {CATEGORY_LABELS[equip.category] ?? equip.category}
                        </span>
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${CONDITION_STYLES[equip.condition] ?? ''}`}>
                          {CONDITION_LABELS[equip.condition] ?? equip.condition}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditEquip(equip)}
                        className="rounded-lg p-2 text-text-muted hover:bg-surface-2 hover:text-text-primary"
                        title="Editar"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(equip)}
                        className="rounded p-1 text-red-400 hover:bg-red-500/10"
                        title="Remover"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <span className={`font-bold ${equip.quantityAvailable <= equip.minQuantity && equip.minQuantity > 0 ? 'text-warning' : 'text-text-primary'}`}>
                      {equip.quantityAvailable}
                    </span>
                    <span className="text-text-muted">de</span>
                    <span className="font-medium text-text-primary">{equip.quantityTotal}</span>
                    <span className="text-text-muted">em estoque</span>
                  </div>

                  {equip.brand && (
                    <p className="mt-1 text-xs text-text-muted">
                      {equip.brand}{equip.model ? ` ${equip.model}` : ''}
                    </p>
                  )}
                  {equip.serialNumber && (
                    <p className="mt-0.5 font-mono text-xs text-text-muted">SN: {equip.serialNumber}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ Tab: Movimentacoes ═════════════════════════════ */}
      {tab === 'movimentacoes' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button
              onClick={() => { setMovForm(INITIAL_MOVEMENT_FORM); setMovSubmitError(null); setMovModalOpen(true); }}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-bold text-accent-fg shadow-lg shadow-accent/15 transition hover:bg-accent-hover"
            >
              <Plus className="h-4 w-4" />
              Nova movimentacao
            </button>
          </div>

          {movements.length === 0 ? (
            <EmptyState
              title="Nenhuma movimentacao registrada"
              description="Registre entradas, saidas e manutencoes de equipamentos."
            />
          ) : (
            <div className="space-y-2">
              {movements.map((mov) => (
                <div
                  key={mov.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3"
                >
                  <div className="shrink-0">
                    {MOVEMENT_TYPE_ICONS[mov.type] ?? <Package className="h-4 w-4 text-text-muted" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-text-primary">{mov.equipment?.name ?? 'Equipamento'}</span>
                      <span className="text-xs text-text-muted">{MOVEMENT_TYPE_LABELS[mov.type] ?? mov.type}</span>
                    </div>
                    <div className="text-sm text-text-secondary">
                      Qtd: {mov.quantity}
                      {mov.reason && <span className="ml-2 text-text-muted">- {mov.reason}</span>}
                    </div>
                    {mov.staff && (
                      <p className="text-xs text-text-muted">por {mov.staff.name}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-text-muted">
                    {new Date(mov.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ Tab: Necessidades ══════════════════════════════ */}
      {tab === 'necessidades' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button
              onClick={() => { setNeedForm(INITIAL_NEED_FORM); setNeedSubmitError(null); setNeedModalOpen(true); }}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-bold text-accent-fg shadow-lg shadow-accent/15 transition hover:bg-accent-hover"
            >
              <Plus className="h-4 w-4" />
              Nova necessidade
            </button>
          </div>

          {needs.length === 0 ? (
            <EmptyState
              title="Nenhuma necessidade registrada"
              description="Registre necessidades de compra de equipamentos."
            />
          ) : (
            <div className="space-y-2">
              {needs.map((need) => (
                <div
                  key={need.id}
                  className="rounded-xl border border-border bg-surface p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text-primary">{need.name}</span>
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${PRIORITY_STYLES[need.priority] ?? ''}`}>
                          {PRIORITY_LABELS[need.priority] ?? need.priority}
                        </span>
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLES[need.status] ?? ''}`}>
                          {STATUS_LABELS[need.status] ?? need.status}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-text-secondary">
                        Qtd: {need.quantityNeeded}
                        {need.estimatedCost && (
                          <span className="ml-2">R$ {Number(need.estimatedCost).toFixed(2)}</span>
                        )}
                      </div>
                      {need.reason && (
                        <p className="mt-1 text-xs text-text-muted">{need.reason}</p>
                      )}
                      {need.requester && (
                        <p className="mt-0.5 text-xs text-text-muted">Solicitado por {need.requester.name}</p>
                      )}
                    </div>
                    {need.status === 'REQUESTED' && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleUpdateNeedStatus(need.id, 'approved')}
                          className="rounded-lg px-2 py-1 text-xs font-bold text-success hover:bg-success/10"
                        >
                          Aprovar
                        </button>
                        <button
                          onClick={() => handleUpdateNeedStatus(need.id, 'rejected')}
                          className="rounded-lg px-2 py-1 text-xs font-bold text-danger hover:bg-danger/10"
                        >
                          Rejeitar
                        </button>
                      </div>
                    )}
                    {need.status === 'APPROVED' && (
                      <button
                        onClick={() => handleUpdateNeedStatus(need.id, 'received')}
                        className="rounded-lg px-2 py-1 text-xs font-bold text-accent hover:bg-accent/10"
                      >
                        Recebido
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ Modals ═════════════════════════════════════════ */}

      {/* Equipment create/edit modal */}
      {equipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-semibold text-text-primary">
              {editingEquip ? 'Editar equipamento' : 'Novo equipamento'}
            </h3>
            <form onSubmit={handleEquipSubmit} className="space-y-3">
              {equipSubmitError && (
                <div className="rounded-md bg-red-500/10 p-2 text-sm text-red-400">{equipSubmitError}</div>
              )}
              <Field label="Nome">
                <input type="text" value={equipForm.name} onChange={(e) => setEquipForm(p => ({ ...p, name: e.target.value }))} className={FIELD_CONTROL} required maxLength={150} />
              </Field>
              <div className={FORM_GRID}>
                <Field label="Categoria">
                  <SmartSelect value={equipForm.category} onChange={(v) => setEquipForm(p => ({ ...p, category: v ?? 'OTHER' }))} options={categoryOptions} placeholder="Buscar" searchable clearable={false} />
                </Field>
                <Field label="Condicao">
                  <SmartSelect value={equipForm.condition} onChange={(v) => setEquipForm(p => ({ ...p, condition: v ?? 'NEW' }))} options={conditionOptions} placeholder="Buscar" searchable clearable={false} />
                </Field>
              </div>
              <div className={FORM_GRID}>
                <Field label="Marca">
                  <input type="text" value={equipForm.brand} onChange={(e) => setEquipForm(p => ({ ...p, brand: e.target.value }))} className={FIELD_CONTROL} maxLength={100} />
                </Field>
                <Field label="Modelo">
                  <input type="text" value={equipForm.model} onChange={(e) => setEquipForm(p => ({ ...p, model: e.target.value }))} className={FIELD_CONTROL} maxLength={100} />
                </Field>
              </div>
              <Field label="Numero de serie">
                <input type="text" value={equipForm.serialNumber} onChange={(e) => setEquipForm(p => ({ ...p, serialNumber: e.target.value }))} className={FIELD_CONTROL} maxLength={100} />
              </Field>
              <div className={FORM_GRID}>
                <Field label="Qtd total">
                  <input type="number" value={equipForm.quantityTotal} onChange={(e) => setEquipForm(p => ({ ...p, quantityTotal: Number(e.target.value) }))} className={FIELD_CONTROL} min={0} />
                </Field>
                <Field label="Qtd disponivel">
                  <input type="number" value={equipForm.quantityAvailable} onChange={(e) => setEquipForm(p => ({ ...p, quantityAvailable: Number(e.target.value) }))} className={FIELD_CONTROL} min={0} />
                </Field>
              </div>
              <div className={FORM_GRID}>
                <Field label="Estoque minimo">
                  <input type="number" value={equipForm.minQuantity} onChange={(e) => setEquipForm(p => ({ ...p, minQuantity: Number(e.target.value) }))} className={FIELD_CONTROL} min={0} />
                </Field>
                <Field label="Custo unitario (R$)">
                  <input type="number" value={equipForm.unitCost} onChange={(e) => setEquipForm(p => ({ ...p, unitCost: e.target.value }))} className={FIELD_CONTROL} min={0} step="0.01" />
                </Field>
              </div>
              <Field label="Fornecedor">
                <input type="text" value={equipForm.supplier} onChange={(e) => setEquipForm(p => ({ ...p, supplier: e.target.value }))} className={FIELD_CONTROL} maxLength={150} />
              </Field>
              <Field label="Observacoes">
                <textarea value={equipForm.notes} onChange={(e) => setEquipForm(p => ({ ...p, notes: e.target.value }))} className={FIELD_CONTROL} rows={2} maxLength={500} />
              </Field>
              <div className={FORM_FOOTER}>
                <button type="button" onClick={() => setEquipModalOpen(false)} className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted">Cancelar</button>
                <button type="submit" disabled={equipSubmitting} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                  {equipSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingEquip ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Movement create modal */}
      {movModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-semibold text-text-primary">Nova movimentacao</h3>
            <form onSubmit={handleMovSubmit} className="space-y-3">
              {movSubmitError && (
                <div className="rounded-md bg-red-500/10 p-2 text-sm text-red-400">{movSubmitError}</div>
              )}
              <Field label="Equipamento">
                <SmartSelect value={movForm.equipmentId} onChange={(v) => setMovForm(p => ({ ...p, equipmentId: v ?? '' }))} options={equipSelectOptions} placeholder="Buscar equipamento" searchable required />
              </Field>
              <div className={FORM_GRID}>
                <Field label="Tipo">
                  <SmartSelect value={movForm.type} onChange={(v) => setMovForm(p => ({ ...p, type: v ?? 'IN' }))} options={movementTypeOptions} placeholder="Buscar" searchable clearable={false} />
                </Field>
                <Field label="Quantidade">
                  <input type="number" value={movForm.quantity} onChange={(e) => setMovForm(p => ({ ...p, quantity: Number(e.target.value) }))} className={FIELD_CONTROL} min={1} required />
                </Field>
              </div>
              <Field label="Motivo">
                <textarea value={movForm.reason} onChange={(e) => setMovForm(p => ({ ...p, reason: e.target.value }))} className={FIELD_CONTROL} rows={2} maxLength={300} />
              </Field>
              <div className={FORM_FOOTER}>
                <button type="button" onClick={() => setMovModalOpen(false)} className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted">Cancelar</button>
                <button type="submit" disabled={movSubmitting} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                  {movSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Need create modal */}
      {needModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-semibold text-text-primary">Nova necessidade</h3>
            <form onSubmit={handleNeedSubmit} className="space-y-3">
              {needSubmitError && (
                <div className="rounded-md bg-red-500/10 p-2 text-sm text-red-400">{needSubmitError}</div>
              )}
              <Field label="Nome">
                <input type="text" value={needForm.name} onChange={(e) => setNeedForm(p => ({ ...p, name: e.target.value }))} className={FIELD_CONTROL} required maxLength={150} />
              </Field>
              <Field label="Equipamento associado (opcional)">
                <SmartSelect value={needForm.equipmentId} onChange={(v) => setNeedForm(p => ({ ...p, equipmentId: v ?? '' }))} options={equipSelectOptions} placeholder="Buscar equipamento" searchable />
              </Field>
              <div className={FORM_GRID}>
                <Field label="Quantidade">
                  <input type="number" value={needForm.quantityNeeded} onChange={(e) => setNeedForm(p => ({ ...p, quantityNeeded: Number(e.target.value) }))} className={FIELD_CONTROL} min={1} required />
                </Field>
                <Field label="Prioridade">
                  <SmartSelect value={needForm.priority} onChange={(v) => setNeedForm(p => ({ ...p, priority: v ?? 'MEDIUM' }))} options={priorityOptions} placeholder="Buscar" searchable clearable={false} />
                </Field>
              </div>
              <Field label="Custo estimado (R$)">
                <input type="number" value={needForm.estimatedCost} onChange={(e) => setNeedForm(p => ({ ...p, estimatedCost: e.target.value }))} className={FIELD_CONTROL} min={0} step="0.01" />
              </Field>
              <Field label="Motivo">
                <textarea value={needForm.reason} onChange={(e) => setNeedForm(p => ({ ...p, reason: e.target.value }))} className={FIELD_CONTROL} rows={2} maxLength={500} />
              </Field>
              <div className={FORM_FOOTER}>
                <button type="button" onClick={() => setNeedModalOpen(false)} className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted">Cancelar</button>
                <button type="submit" disabled={needSubmitting} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                  {needSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        title="Remover equipamento"
        message={`Tem certeza que deseja remover "${deleteTarget?.name}"? Todas as movimentacoes associadas serao mantidas no historico.`}
        onConfirm={handleDelete}
        loading={deleting}
        confirmLabel="Remover"
        variant="danger"
      />
    </div>
  );
};
