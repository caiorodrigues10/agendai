import { useEffect, useId, useRef, useState } from 'react';
import { LuCalendarPlus } from 'react-icons/lu';
import { adminAccountActionsApi } from '../../infra/adminAccountActionsApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { Button } from '../../components/ui/Button';
import { Field, FIELD_CONTROL } from '../../components/ui/Field';

interface Props {
  shopId: string;
  shopName: string;
  canExtend: boolean;
  onExtended: (days: number) => void;
}

/** Independent action inside the user form: never submit/save user details. */
export function ExtendTrialFields({ shopId, shopName, canExtend, onExtended }: Props) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLFieldSetElement>(null);
  const daysInput = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [days, setDays] = useState('7');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (open) daysInput.current?.focus();
  }, [open]);
  useEffect(() => {
    if (open) panel.current?.scrollIntoView?.({ block: 'nearest' });
  }, [open, error]);
  const amount = Number(days);
  const validDays = days.trim() !== '' && Number.isInteger(amount) && amount >= 1 && amount <= 90;
  const canSubmit =
    canExtend && validDays && reason.trim().length >= 10 && reason.trim().length <= 500;

  async function submit() {
    if (!canSubmit || busy) return;
    setBusy(true);
    setError(null);
    try {
      await adminAccountActionsApi.accountAction(shopId, 'extend-trial', {
        days: amount,
        reason: reason.trim(),
      });
      setOpen(false);
      setReason('');
      onExtended(amount);
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível adicionar os dias.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="space-y-2 border-t border-border px-4 py-3">
        <Button
          ref={trigger}
          variant="secondary"
          size="sm"
          className="w-full sm:w-auto"
          disabled={!canExtend || busy}
          aria-expanded={open && canExtend}
          aria-controls={id}
          onClick={() => setOpen(value => !value)}
        >
          <LuCalendarPlus size={16} aria-hidden="true" /> Adicionar dias
        </Button>
        {!canExtend && (
          <p className="text-xs text-text-muted">
            Disponível para assinaturas em período grátis (trial). Planos pagos não são alterados
            por esta ação.
          </p>
        )}
      </div>
      {open && canExtend && (
        <fieldset
          ref={panel}
          id={id}
          className="space-y-4 border-t border-border bg-surface/50 p-4"
          disabled={busy}
        >
          <legend className="sr-only">Adicionar dias ao período grátis</legend>
          <div>
            <h5 className="text-sm font-semibold text-text-primary">
              Adicionar dias ao período grátis
            </h5>
            <p className="mt-1 text-xs leading-relaxed text-text-secondary">
              A extensão será aplicada ao salão {shopName}, independentemente de salvar os dados do
              usuário.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
            <Field
              label="Dias para adicionar"
              hint="De 1 a 90 dias."
              error={validDays ? undefined : 'Informe um número inteiro de 1 a 90.'}
            >
              <input
                ref={daysInput}
                onKeyDown={event => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    void submit();
                  }
                }}
                type="number"
                min={1}
                max={90}
                step={1}
                inputMode="numeric"
                className={FIELD_CONTROL}
                value={days}
                onChange={event => setDays(event.target.value)}
              />
            </Field>
            <Field
              label="Motivo da extensão"
              hint="Obrigatório para auditoria: mínimo de 10 caracteres."
            >
              <textarea
                rows={3}
                maxLength={500}
                className={FIELD_CONTROL}
                placeholder="Descreva o motivo da liberação dos dias."
                value={reason}
                onChange={event => setReason(event.target.value)}
              />
            </Field>
          </div>
          {error && (
            <p role="alert" className="rounded-xl bg-danger/10 p-3 text-sm text-danger">
              {error}
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setOpen(false);
                setError(null);
                trigger.current?.focus();
              }}
              disabled={busy}
            >
              Cancelar extensão
            </Button>
            <Button
              size="sm"
              disabled={!canSubmit || busy}
              loading={busy}
              onClick={() => void submit()}
            >
              Confirmar dias
            </Button>
          </div>
        </fieldset>
      )}
    </>
  );
}
