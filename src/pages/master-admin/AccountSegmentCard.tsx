import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { LuLayers, LuPencil, LuTriangleAlert, LuLoader } from 'react-icons/lu';
import { SmartSelect } from '../../components/ui/SmartSelect';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ModalShell } from '../../components/patterns/ModalShell';
import {
  adminInternalApi,
  SegmentCatalogItem,
  SegmentConflict,
  SegmentImpact,
} from '../../infra/adminInternalApi';
import { ApiError } from '../../infra/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import { getErrorMessage } from '../../utils/errorMessage';
import {
  INTERNAL_PERMISSIONS,
  hasInternalPermission,
} from '../../utils/internalPermissions';

const MODULE_LABEL: Record<string, string> = {
  products: 'Produtos',
  equipment: 'Equipamento',
  commissions: 'Comissões',
  tip: 'Gorjeta',
};

const FEATURE_LABEL: Record<string, string> = {
  caseManagement: 'Gestão de processos',
};

interface AccountSegmentCardProps {
  shop: { id: string; name: string; businessSegment: string };
  onChanged: () => void;
}

type Preview = {
  hiddenModules: string[];
  shownModules: string[];
  lostFeatures: string[];
  gainedFeatures: string[];
  advertisingChange: 'restricted' | 'unrestricted' | 'none';
};

const emptyPreview: Preview = {
  hiddenModules: [],
  shownModules: [],
  lostFeatures: [],
  gainedFeatures: [],
  advertisingChange: 'none',
};

function diffPreview(
  current: SegmentCatalogItem | undefined,
  target: SegmentCatalogItem | undefined,
): Preview {
  if (!current || !target) return emptyPreview;
  return {
    hiddenModules: current.visibleModules.filter(
      (module) => !target.visibleModules.includes(module),
    ),
    shownModules: target.visibleModules.filter(
      (module) => !current.visibleModules.includes(module),
    ),
    lostFeatures: current.features.filter(
      (feature) => !target.features.includes(feature),
    ),
    gainedFeatures: target.features.filter(
      (feature) => !current.features.includes(feature),
    ),
    advertisingChange:
      !current.advertisingRestricted && target.advertisingRestricted
        ? 'restricted'
        : current.advertisingRestricted && !target.advertisingRestricted
          ? 'unrestricted'
          : 'none',
  };
}

export const AccountSegmentCard: React.FC<AccountSegmentCardProps> = ({
  shop,
  onChanged,
}) => {
  const { user } = useAuth();
  const canManage = hasInternalPermission(
    user?.internalPermissions,
    INTERNAL_PERMISSIONS.ACCOUNTS_MANAGE,
  );

  const [catalog, setCatalog] = useState<SegmentCatalogItem[] | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [conflicts, setConflicts] = useState<SegmentConflict[]>([]);
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const loadCatalog = useCallback(async () => {
    setCatalogError(null);
    try {
      const response = await adminInternalApi.getSegments();
      setCatalog(response.data);
    } catch {
      setCatalogError('Não foi possível carregar o catálogo de segmentos.');
    }
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const current = useMemo(
    () => catalog?.find((item) => item.segment === shop.businessSegment),
    [catalog, shop.businessSegment],
  );
  const target = useMemo(
    () => catalog?.find((item) => item.segment === selected),
    [catalog, selected],
  );
  const preview = useMemo(() => diffPreview(current, target), [current, target]);

  const options = useMemo(
    () =>
      (catalog ?? []).map((item) => ({
        value: item.segment,
        label: item.label,
        description: `${item.shops} salão(ões) · ${item.visibleModules.length} módulo(s)`,
      })),
    [catalog],
  );

  const closeDialog = () => {
    setOpen(false);
    setSelected(null);
    setReason('');
    setConflicts([]);
    setAcknowledged(false);
    setError(null);
  };

  const requestChange = () => {
    if (!selected || selected === shop.businessSegment) {
      setError('Escolha um segmento diferente do atual.');
      return;
    }
    if (reason.trim().length < 10) {
      setError('Informe um motivo com pelo menos 10 caracteres.');
      return;
    }
    setError(null);
    setConfirmOpen(true);
  };

  const submit = async () => {
    if (!selected) return;
    setSaving(true);
    setError(null);
    try {
      await adminInternalApi.updateAccountSegment(shop.id, {
        segment: selected,
        reason: reason.trim(),
        confirm: conflicts.length > 0 ? acknowledged : undefined,
      });
      setConfirmOpen(false);
      closeDialog();
      await loadCatalog();
      onChanged();
    } catch (err) {
      const apiError = err instanceof ApiError ? err : null;
      const details = (apiError?.data as { errors?: { conflicts?: SegmentConflict[] } } | undefined)
        ?.errors;
      if (apiError?.code === 'SEGMENT_CHANGE_REQUIRES_CONFIRMATION' && details?.conflicts) {
        setConflicts(details.conflicts);
        setAcknowledged(false);
        setConfirmOpen(false);
        setError('A troca tem dados incompatíveis. Revise e confirme para prosseguir.');
        return;
      }
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const impactSummary = target
    ? `Trocar "${current?.label ?? shop.businessSegment}" por "${target.label}"? A troca é registrada na auditoria com o valor anterior e o novo.`
    : 'Selecione o novo segmento.';

  return (
    <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold flex items-center gap-2">
          <LuLayers size={16} className="text-accent" /> Segmento
        </h2>
        {canManage && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
          >
            <LuPencil size={12} /> Alterar segmento
          </button>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between gap-2">
          <span className="text-text-muted">Segmento atual</span>
          <span className="font-medium">{current?.label ?? shop.businessSegment}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-text-muted">Módulos visíveis</span>
          <span className="font-medium">
            {(current?.visibleModules ?? []).length > 0
              ? (current?.visibleModules ?? [])
                  .map((module) => MODULE_LABEL[module] ?? module)
                  .join(', ')
              : 'Nenhum'}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-text-muted">Features</span>
          <span className="font-medium">
            {(current?.features ?? []).length > 0
              ? (current?.features ?? [])
                  .map((feature) => FEATURE_LABEL[feature] ?? feature)
                  .join(', ')
              : 'Nenhuma'}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-text-muted">Publicidade</span>
          <span className="font-medium">
            {current?.advertisingRestricted ? 'Restrita' : 'Permitida'}
          </span>
        </div>
      </div>

      {catalogError && (
        <p role="alert" className="text-xs text-danger">
          {catalogError}
        </p>
      )}

      <ModalShell
        open={open}
        title="Alterar segmento"
        titleId="account-segment-title"
        variant="sheet"
        onClose={closeDialog}
        footer={
          <>
            <button
              type="button"
              onClick={closeDialog}
              disabled={saving}
              className="flex-1 min-h-11 rounded-xl border border-border font-bold text-text-secondary disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={requestChange}
              disabled={
                saving ||
                !selected ||
                selected === shop.businessSegment ||
                (conflicts.length > 0 && !acknowledged)
              }
              className="flex-1 min-h-11 rounded-xl bg-accent font-bold text-accent-fg disabled:opacity-50"
            >
              Revisar troca
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            O catálogo de segmentos é definido no código e vale para todos os salões. Esta troca
            muda o que o salão enxerga no painel.
          </p>

          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1.5" htmlFor="account-segment-select">
              Novo segmento
            </label>
            <SmartSelect
              id="account-segment-select"
              options={options}
              value={selected}
              onChange={(value) => {
                setSelected(value);
                setConflicts([]);
                setAcknowledged(false);
              }}
              searchable
              clearable={false}
              disabled={saving || !catalog}
              placeholder={catalog ? 'Selecione o segmento…' : 'Carregando catálogo…'}
              aria-label="Novo segmento"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1.5" htmlFor="account-segment-reason">
              Motivo da troca
            </label>
            <textarea
              id="account-segment-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Explique por que o segmento está errado (mínimo de 10 caracteres)."
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
            />
          </div>

          {target && (
            <div className="rounded-lg border border-border bg-bg/40 p-3 space-y-2 text-sm">
              <p className="font-bold text-text-primary">Prévia do impacto</p>
              {preview.hiddenModules.length > 0 && (
                <p className="text-danger">
                  Passam a ser ocultados: {preview.hiddenModules.map((m) => MODULE_LABEL[m] ?? m).join(', ')}
                </p>
              )}
              {preview.shownModules.length > 0 && (
                <p className="text-success">
                  Passam a ficar disponíveis: {preview.shownModules.map((m) => MODULE_LABEL[m] ?? m).join(', ')}
                </p>
              )}
              {preview.lostFeatures.length > 0 && (
                <p className="text-warning">
                  Features perdidas: {preview.lostFeatures.map((f) => FEATURE_LABEL[f] ?? f).join(', ')}
                </p>
              )}
              {preview.gainedFeatures.length > 0 && (
                <p className="text-success">
                  Features liberadas: {preview.gainedFeatures.map((f) => FEATURE_LABEL[f] ?? f).join(', ')}
                </p>
              )}
              {preview.advertisingChange === 'restricted' && (
                <p className="text-warning">
                  O novo segmento não permite divulgação comercial (campanhas, avaliação pública,
                  NPS, indicações e fidelidade).
                </p>
              )}
              {preview.advertisingChange === 'unrestricted' && (
                <p className="text-success">O novo segmento volta a permitir divulgação comercial.</p>
              )}
              {preview.hiddenModules.length === 0 &&
                preview.shownModules.length === 0 &&
                preview.lostFeatures.length === 0 &&
                preview.gainedFeatures.length === 0 &&
                preview.advertisingChange === 'none' && (
                  <p className="text-text-muted">Nenhuma mudança de módulos, features ou publicidade.</p>
                )}
            </div>
          )}

          {conflicts.length > 0 && (
            <div className="rounded-lg border border-warning/40 bg-warning/10 p-3 space-y-2 text-sm">
              <p className="flex items-center gap-2 font-bold text-warning">
                <LuTriangleAlert size={14} /> Dados incompatíveis com o novo segmento
              </p>
              <ul className="list-disc pl-5 text-text-secondary">
                {conflicts.map((conflict) => (
                  <li key={conflict.code}>
                    {conflict.message} ({conflict.count})
                  </li>
                ))}
              </ul>
              <label className="flex items-start gap-2 text-text-secondary">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(event) => setAcknowledged(event.target.checked)}
                  className="mt-0.5"
                />
                <span>Confirmo a troca mesmo com esses dados.</span>
              </label>
            </div>
          )}

          {error && (
            <p role="alert" className="flex items-center gap-2 text-sm text-danger">
              {saving ? <LuLoader size={14} className="animate-spin" /> : <LuTriangleAlert size={14} />}
              {error}
            </p>
          )}
        </div>
      </ModalShell>

      <ConfirmDialog
        open={confirmOpen}
        title="Alterar segmento"
        message={impactSummary}
        confirmLabel="Alterar segmento"
        loading={saving}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void submit()}
      />
    </div>
  );
};

export default AccountSegmentCard;
