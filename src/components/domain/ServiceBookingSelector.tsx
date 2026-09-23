import React, { useState, useMemo } from 'react';
import { LuCheck as Check, LuPlus as Plus, LuMinus as Minus } from 'react-icons/lu';
import type { Service } from '../../types';

interface Variation {
  id: string;
  name: string;
  price: number;
  avgTimeMinutes: number;
}

interface Addon {
  id: string;
  name: string;
  price: number;
  avgTimeMinutes: number;
}

interface Combo {
  id: string;
  name: string;
  comboPrice: number;
  items: { serviceId: string; serviceName: string; discountedPrice: number }[];
}

interface ServiceBookingSelectorProps {
  services: Service[];
  variations?: Record<string, Variation[]>;
  addons?: Record<string, Addon[]>;
  combos?: Combo[];
  selectedServiceId: string;
  selectedVariationId?: string;
  selectedAddonIds?: string[];
  selectedComboId?: string;
  onSelectService: (serviceId: string) => void;
  onSelectVariation: (variationId: string) => void;
  onToggleAddon: (addonId: string) => void;
  onSelectCombo: (comboId: string) => void;
}

export const ServiceBookingSelector: React.FC<ServiceBookingSelectorProps> = ({
  services,
  variations = {},
  addons = {},
  combos = [],
  selectedServiceId,
  selectedVariationId,
  selectedAddonIds = [],
  selectedComboId,
  onSelectService,
  onSelectVariation,
  onToggleAddon,
  onSelectCombo,
}) => {
  const selectedService = services.find(s => s.id === selectedServiceId);
  const serviceVariations = selectedServiceId ? variations[selectedServiceId] || [] : [];
  const serviceAddons = selectedServiceId ? addons[selectedServiceId] || [] : [];

  const selectedVariation = serviceVariations.find(v => v.id === selectedVariationId);
  const selectedAddons = serviceAddons.filter(a => selectedAddonIds.includes(a.id));
  const selectedCombo = combos.find(c => c.id === selectedComboId);

  const total = useMemo(() => {
    if (selectedCombo) return selectedCombo.comboPrice;
    let base = selectedVariation?.price ?? selectedService?.price ?? 0;
    let time = selectedVariation?.avgTimeMinutes ?? selectedService?.avgTimeMinutes ?? 0;
    for (const a of selectedAddons) {
      base += a.price;
      time += a.avgTimeMinutes;
    }
    return base;
  }, [selectedVariation, selectedService, selectedAddons, selectedCombo]);

  const totalTime = useMemo(() => {
    if (selectedCombo) return 0;
    let time = selectedVariation?.avgTimeMinutes ?? selectedService?.avgTimeMinutes ?? 0;
    for (const a of selectedAddons) {
      time += a.avgTimeMinutes;
    }
    return time;
  }, [selectedVariation, selectedService, selectedAddons, selectedCombo]);

  return (
    <div className="space-y-4">
      {/* Services */}
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-text-secondary">Serviço</p>
        <div className="space-y-1.5">
          {services.map(s => (
            <button
              key={s.id}
              onClick={() => { onSelectService(s.id); onSelectVariation(''); }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                selectedServiceId === s.id
                  ? 'border border-accent/40 bg-accent/10 text-accent'
                  : 'border border-border bg-surface text-text-primary hover:border-border-strong'
              }`}
            >
              <span className="font-bold">{s.name}</span>
              <span className="text-xs">R$ {(s.price / 100).toFixed(2)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Variations */}
      {serviceVariations.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-text-secondary">Variação</p>
          <div className="space-y-1.5">
            {serviceVariations.map(v => (
              <button
                key={v.id}
                onClick={() => onSelectVariation(v.id)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                  selectedVariationId === v.id
                    ? 'border border-accent/40 bg-accent/10 text-accent'
                    : 'border border-border bg-surface text-text-primary hover:border-border-strong'
                }`}
              >
                <span>{v.name}</span>
                <span className="text-xs">R$ {(v.price / 100).toFixed(2)} · {v.avgTimeMinutes}min</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Addons */}
      {serviceAddons.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-text-secondary">Adicionais</p>
          <div className="space-y-1.5">
            {serviceAddons.map(a => {
              const selected = selectedAddonIds.includes(a.id);
              return (
                <button
                  key={a.id}
                  onClick={() => onToggleAddon(a.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                    selected
                      ? 'border border-accent/40 bg-accent/10 text-accent'
                      : 'border border-border bg-surface text-text-primary hover:border-border-strong'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {selected ? <Check size={14} className="text-accent" /> : <Plus size={14} className="text-text-muted" />}
                    {a.name}
                  </span>
                  <span className="text-xs">+R$ {(a.price / 100).toFixed(2)} · +{a.avgTimeMinutes}min</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Combos */}
      {combos.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-text-secondary">Combos</p>
          <div className="space-y-1.5">
            {combos.map(c => (
              <button
                key={c.id}
                onClick={() => onSelectCombo(c.id === selectedComboId ? '' : c.id)}
                className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                  selectedComboId === c.id
                    ? 'border border-accent/40 bg-accent/10 text-accent'
                    : 'border border-border bg-surface text-text-primary hover:border-border-strong'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">{c.name}</span>
                  <span className="text-xs font-bold">R$ {(c.comboPrice / 100).toFixed(2)}</span>
                </div>
                <p className="mt-1 text-xs text-text-muted">
                  {c.items.map(i => i.serviceName).join(' + ')}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Running total */}
      <div className="rounded-xl border border-border bg-surface p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Total</span>
          <span className="text-lg font-bold text-accent">R$ {(total / 100).toFixed(2)}</span>
        </div>
        {totalTime > 0 && (
          <p className="mt-0.5 text-xs text-text-muted">~{totalTime} minutos</p>
        )}
      </div>
    </div>
  );
};
