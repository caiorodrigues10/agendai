import { useState } from 'react';
import { Button } from '../../../../components/ui/Button';
import { Field, FIELD_CONTROL } from '../../../../components/ui/Field';
import { SmartSelect } from '../../../../components/ui/SmartSelect';
import type { DesignPromo, DesignPromoKind } from '../../../../infra/postsApi';
import { PanelHeading, PanelNotice, supportsCommercialBlock, type DesignPanelProps } from '../panelShared';

interface PromoDraft {
  kind: DesignPromoKind;
  percent: string;
  amount: string;
  from: string;
  to: string;
  promoLabel: string;
  promoUnit: string;
}

const TYPE_OPTIONS = [
  { value: 'percent' as const, label: 'Percentual' },
  { value: 'money' as const, label: 'Valor fixo' },
  { value: 'from-to' as const, label: 'De até' },
  { value: 'free' as const, label: 'Brindado pelo dono' },
  { value: 'custom' as const, label: 'Texto do dono' },
];

function draftFromPromo(promo: DesignPromo | undefined): PromoDraft {
  return {
    kind: promo?.kind ?? 'percent',
    percent: promo?.percent === undefined ? '' : String(promo.percent),
    amount: promo?.amount === undefined ? '' : String(promo.amount),
    from: promo?.from === undefined ? '' : String(promo.from),
    to: promo?.to === undefined ? '' : String(promo.to),
    promoLabel: promo?.promoLabel ?? '',
    promoUnit: promo?.promoUnit ?? '',
  };
}

function numberValue(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function promoFromDraft(draft: PromoDraft): DesignPromo | undefined {
  const promo: DesignPromo = { kind: draft.kind };
  const label = draft.promoLabel.trim();
  const unit = draft.promoUnit.trim();

  if (draft.kind === 'percent') {
    const percent = numberValue(draft.percent);
    if (percent === undefined || percent < 1 || percent > 99) return undefined;
    promo.percent = percent;
  } else if (draft.kind === 'money') {
    const amount = numberValue(draft.amount);
    if (amount === undefined || amount < 0) return undefined;
    promo.amount = amount;
  } else if (draft.kind === 'from-to') {
    const from = numberValue(draft.from);
    const to = numberValue(draft.to);
    if (from === undefined || to === undefined || from < 0 || to < 0) return undefined;
    promo.from = from;
    promo.to = to;
  } else if (!label) {
    return undefined;
  }

  if (label) promo.promoLabel = label;
  if (unit) promo.promoUnit = unit;
  return promo;
}

export default function PromotionPanel({ state, dispatch, design }: DesignPanelProps) {
  const [draft, setDraft] = useState<PromoDraft>(() => draftFromPromo(state.designContent.promo));
  const allowPromo = supportsCommercialBlock(design, 'promo');
  const allowValidity = supportsCommercialBlock(design, 'validity');

  const updateDraft = (patch: Partial<PromoDraft>) => {
    const next = { ...draft, ...patch };
    setDraft(next);
    dispatch({ type: 'set-content-promo', promo: promoFromDraft(next) });
  };

  if (!allowPromo && !allowValidity) {
    return (
      <section aria-label="Promoção" className="space-y-4">
        <PanelHeading title="Promoção" />
        <PanelNotice>Esta composição não possui blocos promocionais.</PanelNotice>
      </section>
    );
  }

  return (
    <section aria-label="Promoção" className="space-y-4">
      <PanelHeading
        title="Promoção"
        description="Os rótulos e valores são enviados exatamente como você digitar. O servidor não acrescenta ofertas ou descontos."
      />

      {allowPromo ? (
        <div className="space-y-4 rounded-xl border border-border bg-surface p-3">
          <SmartSelect
            label="Tipo de promoção"
            value={draft.kind}
            options={TYPE_OPTIONS}
            onChange={value => {
              if (!value) return;
              const next = draftFromPromo(undefined);
              updateDraft({ ...next, kind: value });
            }}
          />

          {draft.kind === 'percent' ? (
            <Field label="Percentual" hint="De 1 a 99.">
              <input
                type="number"
                min={1}
                max={99}
                value={draft.percent}
                onChange={event => updateDraft({ percent: event.target.value })}
                className={FIELD_CONTROL}
              />
            </Field>
          ) : null}
          {draft.kind === 'money' ? (
            <Field label="Valor" hint="Informe apenas o número.">
              <input
                type="number"
                min={0}
                max={1_000_000}
                step="0.01"
                value={draft.amount}
                onChange={event => updateDraft({ amount: event.target.value })}
                className={FIELD_CONTROL}
              />
            </Field>
          ) : null}
          {draft.kind === 'from-to' ? (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Valor anterior">
                <input
                  type="number"
                  min={0}
                  max={1_000_000}
                  step="0.01"
                  value={draft.from}
                  onChange={event => updateDraft({ from: event.target.value })}
                  className={FIELD_CONTROL}
                />
              </Field>
              <Field label="Valor atual">
                <input
                  type="number"
                  min={0}
                  max={1_000_000}
                  step="0.01"
                  value={draft.to}
                  onChange={event => updateDraft({ to: event.target.value })}
                  className={FIELD_CONTROL}
                />
              </Field>
            </div>
          ) : null}
          {draft.kind === 'free' || draft.kind === 'custom' ? (
            <Field label="Texto da promoção" hint="Texto literal do dono.">
              <input
                type="text"
                maxLength={40}
                value={draft.promoLabel}
                onChange={event => updateDraft({ promoLabel: event.target.value })}
                placeholder="Digite o texto exibido"
                className={FIELD_CONTROL}
              />
            </Field>
          ) : null}

          {draft.kind !== 'free' && draft.kind !== 'custom' ? (
            <Field label="Rótulo do dono" hint="Opcional. Enviado literalmente, sem palavras automáticas.">
              <input
                type="text"
                maxLength={40}
                value={draft.promoLabel}
                onChange={event => updateDraft({ promoLabel: event.target.value })}
                placeholder="Ex.: de desconto"
                className={FIELD_CONTROL}
              />
            </Field>
          ) : null}
          <Field label="Complemento do dono" hint="Opcional. Enviado literalmente.">
            <input
              type="text"
              maxLength={40}
              value={draft.promoUnit}
              onChange={event => updateDraft({ promoUnit: event.target.value })}
              placeholder="Ex.: para novos clientes"
              className={FIELD_CONTROL}
            />
          </Field>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDraft(draftFromPromo(undefined));
              dispatch({ type: 'set-content-promo', promo: undefined });
            }}
            className="text-danger"
          >
            Remover promoção
          </Button>
        </div>
      ) : null}

      {allowValidity ? (
        <Field label="Validade" hint="Texto livre com até 40 caracteres.">
          <input
            type="text"
            maxLength={40}
            value={state.designContent.validUntil ?? ''}
            onChange={event => dispatch({
              type: 'set-content-field',
              field: 'validUntil',
              value: event.target.value,
            })}
            placeholder="Ex.: até sexta"
            className={FIELD_CONTROL}
          />
        </Field>
      ) : null}
    </section>
  );
}
