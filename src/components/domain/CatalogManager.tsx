import React, { useEffect, useState } from 'react';
import {
  LuPlus as Plus,
  LuPencil as Pencil,
  LuTrash2 as Trash2,
  LuLoaderCircle as Loader2,
  LuGripVertical as GripVertical,
  LuPackage as Package,
  LuPuzzle as Puzzle,
  LuLayers as Layers,
  LuTag as Tag,
} from 'react-icons/lu';
import { catalogApi, ServiceVariation, ServiceAddon, ServiceCombo } from '../../infra/catalogApi';
import { useBarbershopFilters } from '../../contexts/BarbershopFiltersContext';
import { useBarbershop } from '../../contexts/BarbershopContext';
import { getErrorMessage } from '../../utils/errorMessage';
import { SmartSelect } from '../ui/SmartSelect';

type CatalogTab = 'variations' | 'addons' | 'combos';

export const CatalogManager: React.FC = () => {
  const { barbershopId } = useBarbershopFilters();
  const { services } = useBarbershop();
  const [activeTab, setActiveTab] = useState<CatalogTab>('variations');
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '');

  // Variations
  const [variations, setVariations] = useState<ServiceVariation[]>([]);
  const [loadingVars, setLoadingVars] = useState(false);
  const [showAddVar, setShowAddVar] = useState(false);
  const [varName, setVarName] = useState('');
  const [varPrice, setVarPrice] = useState('');
  const [varTime, setVarTime] = useState('');
  const [creatingVar, setCreatingVar] = useState(false);

  // Addons
  const [addons, setAddons] = useState<ServiceAddon[]>([]);
  const [loadingAddons, setLoadingAddons] = useState(false);
  const [showAddAddon, setShowAddAddon] = useState(false);
  const [addonName, setAddonName] = useState('');
  const [addonPrice, setAddonPrice] = useState('');
  const [addonTime, setAddonTime] = useState('');
  const [creatingAddon, setCreatingAddon] = useState(false);

  // Combos
  const [combos, setCombos] = useState<ServiceCombo[]>([]);
  const [loadingCombos, setLoadingCombos] = useState(false);
  const [showAddCombo, setShowAddCombo] = useState(false);
  const [comboName, setComboName] = useState('');
  const [comboDesc, setComboDesc] = useState('');
  const [comboPrice, setComboPrice] = useState('');
  const [comboItems, setComboItems] = useState<{ serviceId: string; originalPrice: number; discountedPrice: number }[]>([]);
  const [creatingCombo, setCreatingCombo] = useState(false);

  const [error, setError] = useState('');
  const serviceOptions = services.map(service => ({
    value: service.id,
    label: service.name,
  }));

  // Load data when service changes
  useEffect(() => {
    if (!barbershopId || !selectedServiceId) return;
    if (activeTab === 'variations') {
      setLoadingVars(true);
      catalogApi.listVariations(barbershopId, { serviceId: selectedServiceId })
        .then(rows => setVariations(Array.isArray(rows) ? rows : []))
        .catch(() => setVariations([]))
        .finally(() => setLoadingVars(false));
    } else if (activeTab === 'addons') {
      setLoadingAddons(true);
      catalogApi.listAddons(barbershopId, { serviceId: selectedServiceId })
        .then(rows => setAddons(Array.isArray(rows) ? rows : []))
        .catch(() => setAddons([]))
        .finally(() => setLoadingAddons(false));
    }
  }, [barbershopId, selectedServiceId, activeTab]);

  useEffect(() => {
    if (!barbershopId || activeTab !== 'combos') return;
    setLoadingCombos(true);
    catalogApi.listCombos(barbershopId)
      .then(rows => setCombos(Array.isArray(rows) ? rows : []))
      .catch(() => setCombos([]))
      .finally(() => setLoadingCombos(false));
  }, [barbershopId, activeTab]);

  const handleCreateVariation = async () => {
    if (!barbershopId || !selectedServiceId || !varName.trim()) return;
    setCreatingVar(true);
    setError('');
    try {
      const v = await catalogApi.createVariation(barbershopId, {
        serviceId: selectedServiceId,
        name: varName.trim(),
        price: Number(varPrice) || 0,
        avgTimeMinutes: Number(varTime) || 0,
      });
      setVariations(prev => [...prev, v]);
      setShowAddVar(false);
      setVarName('');
      setVarPrice('');
      setVarTime('');
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao criar variação.'));
    } finally {
      setCreatingVar(false);
    }
  };

  const handleCreateAddon = async () => {
    if (!barbershopId || !selectedServiceId || !addonName.trim()) return;
    setCreatingAddon(true);
    setError('');
    try {
      const a = await catalogApi.createAddon(barbershopId, {
        serviceId: selectedServiceId,
        name: addonName.trim(),
        price: Number(addonPrice) || 0,
        avgTimeMinutes: Number(addonTime) || 0,
      });
      setAddons(prev => [...prev, a]);
      setShowAddAddon(false);
      setAddonName('');
      setAddonPrice('');
      setAddonTime('');
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao criar addon.'));
    } finally {
      setCreatingAddon(false);
    }
  };

  const handleCreateCombo = async () => {
    if (!barbershopId || !comboName.trim() || comboItems.length === 0) return;
    setCreatingCombo(true);
    setError('');
    try {
      const c = await catalogApi.createCombo(barbershopId, {
        name: comboName.trim(),
        description: comboDesc.trim() || undefined,
        comboPrice: Number(comboPrice) || 0,
        items: comboItems.map((item, i) => ({
          ...item,
          serviceName: services.find(s => s.id === item.serviceId)?.name || '',
          discountedPrice: item.discountedPrice,
          originalPrice: item.originalPrice,
          sortOrder: i,
        })),
      });
      setCombos(prev => [...prev, c]);
      setShowAddCombo(false);
      setComboName('');
      setComboDesc('');
      setComboPrice('');
      setComboItems([]);
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao criar combo.'));
    } finally {
      setCreatingCombo(false);
    }
  };

  const addComboItem = () => {
    setComboItems(prev => [...prev, { serviceId: services[0]?.id || '', originalPrice: 0, discountedPrice: 0 }]);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-text-primary">Catálogo Avançado</h3>

      {error && <p className="text-xs text-error">{error}</p>}

      {/* Service selector */}
      <SmartSelect
        label="Serviço"
        value={selectedServiceId}
        onChange={setSelectedServiceId}
        options={serviceOptions}
        placeholder="Buscar serviço"
        searchable
      />

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-border bg-surface p-1">
        {([
          { id: 'variations' as const, label: 'Variações', icon: Layers },
          { id: 'addons' as const, label: 'Addons', icon: Puzzle },
          { id: 'combos' as const, label: 'Combos', icon: Package },
        ]).map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold ${
                activeTab === tab.id ? 'bg-accent text-accent-fg' : 'text-text-secondary hover:bg-surface-2'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Variations */}
      {activeTab === 'variations' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-text-secondary">Variações do serviço selecionado</p>
            <button
              onClick={() => setShowAddVar(!showAddVar)}
              className="inline-flex items-center gap-1 rounded-lg bg-accent/12 px-3 py-1.5 text-xs font-bold text-accent"
            >
              <Plus size={14} /> Adicionar
            </button>
          </div>

          {showAddVar && (
            <div className="rounded-xl border border-border bg-bg p-3 space-y-2">
              <input
                type="text"
                placeholder="Nome da variação"
                value={varName}
                onChange={e => setVarName(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Preço (centavos)"
                  value={varPrice}
                  onChange={e => setVarPrice(e.target.value)}
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Tempo (min)"
                  value={varTime}
                  onChange={e => setVarTime(e.target.value)}
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => void handleCreateVariation()}
                  disabled={creatingVar || !varName.trim()}
                  className="flex items-center gap-1 rounded-lg bg-accent px-3 py-2 text-xs font-bold text-accent-fg disabled:opacity-50"
                >
                  {creatingVar ? <Loader2 className="animate-spin" size={12} /> : <Plus size={12} />}
                  Salvar
                </button>
                <button onClick={() => setShowAddVar(false)} className="text-xs text-text-muted hover:text-text-secondary">Cancelar</button>
              </div>
            </div>
          )}

          {loadingVars ? (
            <div className="flex justify-center py-6"><Loader2 className="animate-spin text-accent" size={20} /></div>
          ) : variations.length === 0 ? (
            <p className="py-4 text-center text-xs text-text-muted">Nenhuma variação.</p>
          ) : (
            variations.map(v => (
              <div key={v.id} className="flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-2.5">
                <div>
                  <p className="text-sm font-bold text-text-primary">{v.name}</p>
                  <p className="text-xs text-text-muted">R$ {(v.price / 100).toFixed(2)} · {v.avgTimeMinutes}min</p>
                </div>
                <div className="flex items-center gap-1">
                  <Tag size={12} className={v.isPublic ? 'text-success' : 'text-text-muted'} />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Addons */}
      {activeTab === 'addons' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-text-secondary">Addons do serviço</p>
            <button
              onClick={() => setShowAddAddon(!showAddAddon)}
              className="inline-flex items-center gap-1 rounded-lg bg-accent/12 px-3 py-1.5 text-xs font-bold text-accent"
            >
              <Plus size={14} /> Adicionar
            </button>
          </div>

          {showAddAddon && (
            <div className="rounded-xl border border-border bg-bg p-3 space-y-2">
              <input
                type="text"
                placeholder="Nome do addon"
                value={addonName}
                onChange={e => setAddonName(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Preço (centavos)"
                  value={addonPrice}
                  onChange={e => setAddonPrice(e.target.value)}
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Tempo (min)"
                  value={addonTime}
                  onChange={e => setAddonTime(e.target.value)}
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => void handleCreateAddon()}
                  disabled={creatingAddon || !addonName.trim()}
                  className="flex items-center gap-1 rounded-lg bg-accent px-3 py-2 text-xs font-bold text-accent-fg disabled:opacity-50"
                >
                  {creatingAddon ? <Loader2 className="animate-spin" size={12} /> : <Plus size={12} />}
                  Salvar
                </button>
                <button onClick={() => setShowAddAddon(false)} className="text-xs text-text-muted hover:text-text-secondary">Cancelar</button>
              </div>
            </div>
          )}

          {loadingAddons ? (
            <div className="flex justify-center py-6"><Loader2 className="animate-spin text-accent" size={20} /></div>
          ) : addons.length === 0 ? (
            <p className="py-4 text-center text-xs text-text-muted">Nenhum addon.</p>
          ) : (
            addons.map(a => (
              <div key={a.id} className="flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-2.5">
                <div>
                  <p className="text-sm font-bold text-text-primary">{a.name}</p>
                  <p className="text-xs text-text-muted">R$ {(a.price / 100).toFixed(2)} · {a.avgTimeMinutes}min</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Combos */}
      {activeTab === 'combos' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-text-secondary">Combos de serviços</p>
            <button
              onClick={() => setShowAddCombo(!showAddCombo)}
              className="inline-flex items-center gap-1 rounded-lg bg-accent/12 px-3 py-1.5 text-xs font-bold text-accent"
            >
              <Plus size={14} /> Criar combo
            </button>
          </div>

          {showAddCombo && (
            <div className="rounded-xl border border-border bg-bg p-3 space-y-2">
              <input
                type="text"
                placeholder="Nome do combo"
                value={comboName}
                onChange={e => setComboName(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
              />
              <input
                type="text"
                placeholder="Descrição (opcional)"
                value={comboDesc}
                onChange={e => setComboDesc(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
              />
              <input
                type="number"
                placeholder="Preço do combo (centavos)"
                value={comboPrice}
                onChange={e => setComboPrice(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
              />

              <div className="space-y-2">
                <p className="text-xs font-bold text-text-secondary">Serviços no combo</p>
                {comboItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <SmartSelect
                      value={item.serviceId}
                      onChange={value => {
                        const svc = services.find(s => s.id === value);
                        setComboItems(prev => prev.map((it, j) => j === i ? {
                          ...it,
                          serviceId: value,
                          originalPrice: svc?.price || 0,
                        } : it));
                      }}
                      options={serviceOptions}
                      placeholder="Buscar serviço"
                      searchable
                      className="flex-1"
                    />
                    <input
                      type="number"
                      placeholder="Preço com desconto"
                      value={item.discountedPrice || ''}
                      onChange={e => setComboItems(prev => prev.map((it, j) => j === i ? { ...it, discountedPrice: Number(e.target.value) || 0 } : it))}
                      className="w-24 rounded-lg border border-border bg-surface px-2 py-1.5 text-xs text-text-primary focus:border-accent focus:outline-none"
                    />
                    <button
                      onClick={() => setComboItems(prev => prev.filter((_, j) => j !== i))}
                      className="rounded p-1 text-text-muted hover:text-error"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addComboItem}
                  className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1.5 text-xs text-text-secondary hover:bg-surface-2"
                >
                  <Plus size={12} /> Adicionar serviço
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => void handleCreateCombo()}
                  disabled={creatingCombo || !comboName.trim() || comboItems.length === 0}
                  className="flex items-center gap-1 rounded-lg bg-accent px-3 py-2 text-xs font-bold text-accent-fg disabled:opacity-50"
                >
                  {creatingCombo ? <Loader2 className="animate-spin" size={12} /> : <Plus size={12} />}
                  Criar combo
                </button>
                <button onClick={() => setShowAddCombo(false)} className="text-xs text-text-muted hover:text-text-secondary">Cancelar</button>
              </div>
            </div>
          )}

          {loadingCombos ? (
            <div className="flex justify-center py-6"><Loader2 className="animate-spin text-accent" size={20} /></div>
          ) : combos.length === 0 ? (
            <p className="py-4 text-center text-xs text-text-muted">Nenhum combo criado.</p>
          ) : (
            combos.map(c => (
              <div key={c.id} className="rounded-xl border border-border bg-surface p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-text-primary">{c.name}</p>
                    {c.description && <p className="text-xs text-text-muted">{c.description}</p>}
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${c.isActive ? 'bg-success/15 text-success' : 'bg-surface-2 text-text-muted'}`}>
                    {c.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <p className="text-sm font-bold text-accent">R$ {(c.comboPrice / 100).toFixed(2)}</p>
                <div className="space-y-1">
                  {c.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs text-text-secondary">
                      <span>{item.serviceName}</span>
                      <span>R$ {(item.discountedPrice / 100).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
