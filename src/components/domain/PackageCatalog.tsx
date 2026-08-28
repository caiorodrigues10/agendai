import React, { useEffect, useState } from 'react';
import { Pencil, Plus, Package } from 'lucide-react';
import { Service, ServicePackage } from '../../types';
import { packagesApi } from '../../infra/packagesApi';
import { getErrorMessage } from '../../utils/errorMessage';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

interface PackageCatalogProps {
  services: Service[];
  canManage: boolean;
}

const emptyForm = {
  name: '',
  serviceId: '',
  sessionCount: '5',
  price: '',
  validityDays: '90',
};

export const PackageCatalog: React.FC<PackageCatalogProps> = ({ services, canManage }) => {
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<{ name?: string; sessionCount?: string; price?: string }>({});

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await packagesApi.listCatalog();
      setPackages(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (pkg: ServicePackage) => {
    setEditingId(pkg.id);
    setIsAdding(false);
    setForm({
      name: pkg.name,
      serviceId: pkg.serviceId,
      sessionCount: String(pkg.sessionCount),
      price: String(pkg.price),
      validityDays: pkg.validityDays != null ? String(pkg.validityDays) : '',
    });
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const sessionCount = Number(form.sessionCount);
    const price = Number(String(form.price).replace(',', '.'));
    const validityDays = form.validityDays.trim() ? Number(form.validityDays) : null;
    const errors: { name?: string; sessionCount?: string; price?: string } = {};
    if (!form.name.trim()) errors.name = 'Nome é obrigatório.';
    if (Number.isNaN(sessionCount) || sessionCount < 2) errors.sessionCount = 'Sessões deve ser ≥ 2.';
    if (Number.isNaN(price) || price <= 0) errors.price = 'Preço deve ser um número maior que zero.';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name.trim(),
        serviceId: form.serviceId,
        sessionCount,
        price,
        validityDays,
      };
      if (editingId) {
        await packagesApi.updateCatalog(editingId, payload);
      } else {
        await packagesApi.createCatalog(payload);
      }
      resetForm();
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (pkg: ServicePackage) => {
    setError(null);
    try {
      await packagesApi.updateCatalog(pkg.id, { active: !pkg.active });
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="mt-10">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <Package size={18} className="text-accent" /> Pacotes
        </h3>
        {canManage && (
          <button
            type="button"
            onClick={() => {
              setIsAdding(true);
              setEditingId(null);
              setForm({ ...emptyForm, serviceId: services[0]?.id ?? '' });
            }}
            className="px-3 py-1.5 bg-accent/10 text-accent border border-accent/50 rounded-lg text-xs font-bold hover:bg-accent-hover hover:text-black transition-all flex items-center gap-1"
          >
            <Plus size={14} /> Novo pacote
          </button>
        )}
      </div>

      {error && <p className="text-sm text-danger mb-3">{error}</p>}

      {loading ? (
        <p className="text-sm text-text-muted">Carregando pacotes...</p>
      ) : packages.length === 0 && !isAdding ? (
        <p className="text-sm text-text-muted bg-surface border border-dashed border-border rounded-xl px-4 py-6 text-center">
          Nenhum pacote cadastrado. Ex.: 5 cortes com desconto.
        </p>
      ) : (
        <div className="space-y-3">
          {packages.map(pkg => (
            <div
              key={pkg.id}
              className="bg-surface p-3 rounded-lg border border-border flex items-center justify-between"
            >
              <div>
                <h4 className="font-medium text-text-primary">{pkg.name}</h4>
                <p className="text-xs text-text-secondary">
                  {pkg.sessionCount} sessões · {pkg.serviceName ?? 'Serviço'} ·{' '}
                  {brl.format(pkg.price)}
                  {pkg.validityDays ? ` · ${pkg.validityDays} dias` : ' · sem validade'}
                  {!pkg.active ? ' · inativo' : ''}
                </p>
              </div>
              {canManage && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(pkg)}
                    className="p-2 text-text-secondary hover:text-accent transition-colors"
                    title="Editar"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleActive(pkg)}
                    className="px-2 py-1 text-[11px] font-bold rounded-md border border-border text-text-secondary hover:text-text-primary"
                  >
                    {pkg.active ? 'Desativar' : 'Ativar'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {(isAdding || editingId) && canManage && (
        <form
          onSubmit={handleSave}
          className="mt-4 bg-surface border border-border rounded-xl p-4 space-y-3"
        >
          <div>
            <input
              className={`w-full bg-bg border rounded-xl px-4 py-3 text-sm text-text-primary ${formErrors.name ? 'border-danger' : 'border-border'}`}
              placeholder="Nome (ex.: Pacote 5 cortes)"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
            {formErrors.name && <p className="mt-1 text-[11px] text-danger">{formErrors.name}</p>}
          </div>
          <select
            className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-text-primary"
            value={form.serviceId}
            onChange={e => setForm(f => ({ ...f, serviceId: e.target.value }))}
          >
            <option value="">Serviço de cada sessão</option>
            {services.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <input
                type="number"
                min={2}
                className={`w-full bg-bg border rounded-xl px-3 py-3 text-sm text-text-primary ${formErrors.sessionCount ? 'border-danger' : 'border-border'}`}
                placeholder="Sessões"
                value={form.sessionCount}
                onChange={e => setForm(f => ({ ...f, sessionCount: e.target.value }))}
              />
              {formErrors.sessionCount && <p className="mt-1 text-[11px] text-danger">{formErrors.sessionCount}</p>}
            </div>
            <div>
              <input
                className={`w-full bg-bg border rounded-xl px-3 py-3 text-sm text-text-primary ${formErrors.price ? 'border-danger' : 'border-border'}`}
                placeholder="Preço"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              />
              {formErrors.price && <p className="mt-1 text-[11px] text-danger">{formErrors.price}</p>}
            </div>
            <div>
              <input
                type="number"
                min={1}
                className="w-full bg-bg border border-border rounded-xl px-3 py-3 text-sm text-text-primary"
                placeholder="Validade (dias)"
                value={form.validityDays}
                onChange={e => setForm(f => ({ ...f, validityDays: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl font-bold text-accent-fg bg-accent hover:bg-accent-hover disabled:opacity-50"
            >
              {saving ? 'Salvando…' : 'Salvar pacote'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-3 rounded-xl border border-border text-text-secondary"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
