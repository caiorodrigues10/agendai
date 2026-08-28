import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CreditCard } from 'lucide-react';

interface CardState {
  number: string;
  holder: string;
  month: string;
  year: string;
  cvv: string;
}

interface CardValidity {
  number: boolean;
  holder: boolean;
  month: boolean;
  year: boolean;
  cvv: boolean;
  allValid: boolean;
}

interface Props {
  defaultNumber?: string;
  defaultHolder?: string;
  defaultMonth?: string;
  defaultYear?: string;
  defaultCVV?: string;
  maskMiddle?: boolean;
  ring1?: string;
  ring2?: string;
  showSubmit?: boolean;
  onChange?: (state: CardState, validity: CardValidity) => void;
  onSubmit?: (state: CardState, validity: CardValidity) => void;
  className?: string;
  submitLabel?: string;
}

function formatNumberSpaces(num: string): string {
  return num.replace(/\s+/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
}

function clampDigits(value: string, maxLen: number) {
  return value.replace(/\D/g, '').slice(0, maxLen);
}

const CreditCardForm = ({
  defaultNumber = '',
  defaultHolder = '',
  defaultMonth = '',
  defaultYear = '',
  defaultCVV = '',
  maskMiddle = true,
  ring1 = '#ff6be7',
  ring2 = '#7288ff',
  showSubmit = true,
  onChange,
  onSubmit,
  className = '',
  submitLabel = 'Confirmar',
}: Props) => {
  const [number, setNumber] = useState(clampDigits(defaultNumber, 19));
  const [holder, setHolder] = useState(defaultHolder.toUpperCase());
  const [month, setMonth] = useState(defaultMonth);
  const [year, setYear] = useState(defaultYear);
  const [cvv, setCVV] = useState(clampDigits(defaultCVV, 4));
  const [focusField, setFocusField] = useState<null | 'number' | 'holder' | 'expire' | 'cvv'>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const flip = focusField === 'cvv';
  const years = useMemo(() => {
    const start = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => String(start + i));
  }, []);

  const validity: CardValidity = useMemo(() => {
    const nValidLength = number.length >= 13;
    const numberValid = nValidLength;
    const holderValid = holder.trim().length >= 2;
    const monthValid = !!month && +month >= 1 && +month <= 12;
    const yearValid = !!year && +year >= new Date().getFullYear();
    const cvvValid = /^\d{3,4}$/.test(cvv);
    return {
      number: numberValid,
      holder: holderValid,
      month: monthValid,
      year: yearValid,
      cvv: cvvValid,
      allValid: numberValid && holderValid && monthValid && yearValid && cvvValid,
    };
  }, [number, holder, month, year, cvv]);

  useEffect(() => {
    onChangeRef.current?.({ number, holder, month, year, cvv }, validity);
  }, [number, holder, month, year, cvv, validity]);

  const displayDigits = useMemo(() => number.slice(0, 16).split(''), [number]);

  const displayedSlots = useMemo(() => {
    const arr: { textTop: string; filed: boolean }[] = [];
    for (let i = 0; i < 16; i++) {
      let content = '#';
      if (i < displayDigits.length) {
        const d = displayDigits[i];
        const shouldMask = maskMiddle && i >= 4 && i <= 11;
        content = shouldMask ? '*' : d;
      }
      arr.push({ textTop: content, filed: i < displayDigits.length });
    }
    return arr;
  }, [displayDigits, maskMiddle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.({ number, holder, month, year, cvv }, validity);
  };

  const inputClass =
    'w-full bg-bg border border-border rounded-xl py-3 px-4 text-text-primary text-sm outline-none transition-colors placeholder:text-text-muted focus:border-accent/60 hover:border-border-strong';

  return (
    <section className={`relative ${className}`}>
      <style>{`
        .cc-card { perspective: 1000px; }
        .cc-card-inner {
          position: relative;
          width: 100%;
          max-width: 420px;
          aspect-ratio: 1.586;
          margin: 0 auto;
          transform-style: preserve-3d;
          transition: transform 0.6s ease;
        }
        .cc-card-inner.cc-flip { transform: rotateY(180deg); }
        .cc-front, .cc-back {
          position: absolute;
          inset: 0;
          border-radius: 20px;
          padding: 24px 28px 28px;
          backface-visibility: hidden;
          overflow: hidden;
          color: #fff;
          display: flex;
          flex-direction: column;
        }
        .cc-front {
          background: linear-gradient(135deg, #323941 0%, #061018 100%);
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
        }
        .cc-back {
          background: linear-gradient(135deg, #323941 0%, #061018 100%);
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
          transform: rotateY(180deg);
          padding: 0;
          display: block;
        }
        .cc-front::before, .cc-back::before {
          content: "";
          position: absolute;
          border: 16px solid var(--cc-ring1);
          border-radius: 100%;
          left: -17%;
          top: -45px;
          height: 300px;
          width: 300px;
          filter: blur(13px);
        }
        .cc-front::after, .cc-back::after {
          content: "";
          position: absolute;
          border: 16px solid var(--cc-ring2);
          border-radius: 100%;
          width: 300px;
          top: 55%;
          left: -200px;
          height: 300px;
          filter: blur(13px);
        }
        .cc-hide-line {
          height: 48px;
          width: calc(100% + 56px);
          margin-left: -28px;
          background: linear-gradient(90deg, #1a1a2e 0%, #3a3a5c 50%, #1a1a2e 100%);
          position: relative;
          z-index: 1;
        }
        .cc-cvv-strip {
          position: relative;
          z-index: 1;
          padding: 20px 28px 28px;
        }
        .cc-signature {
          width: 100%;
          height: 40px;
          background: rgba(255,255,255,0.12);
          border-radius: 4px;
          margin-bottom: 16px;
          position: relative;
          overflow: hidden;
        }
        .cc-signature::after {
          content: "";
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            90deg,
            transparent,
            transparent 8px,
            rgba(255,255,255,0.06) 8px,
            rgba(255,255,255,0.06) 9px
          );
        }
        .cc-cvv-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .cc-cvv-label {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          opacity: 0.45;
          letter-spacing: 2px;
          flex-shrink: 0;
        }
        .cc-cvv-field {
          flex: 1;
          max-width: 120px;
          background: rgba(255,255,255,0.85);
          border-radius: 6px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: 0 12px;
          font-size: 15px;
          letter-spacing: 4px;
          font-family: monospace;
          font-style: italic;
          color: #1a1a2e;
        }
        .cc-number-row {
          display: flex;
          gap: 0;
          margin-bottom: 28px;
          position: relative;
          z-index: 1;
          font-size: 20px;
          font-family: monospace;
          overflow: hidden;
          height: 28px;
        }
        .cc-number-row .cc-slot { display: inline-flex; }
        .cc-number-row .cc-slot:nth-child(4n) { margin-right: 12px; }
        .cc-number-row .cc-digit {
          display: flex;
          flex-direction: column;
          height: 28px;
          line-height: 28px;
          transition: transform 0.2s ease;
          overflow: hidden;
          flex-shrink: 0;
        }
        .cc-number-row .cc-digit.cc-filed { transform: translateY(-28px); }
        .cc-number-row .cc-row { height: 28px; display: block; }
        .cc-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          z-index: 1;
          margin-top: auto;
        }
        .cc-highlight {
          display: none;
        }
      `}</style>

      <div
        className="cc-card"
        style={{ ['--cc-ring1' as string]: ring1, ['--cc-ring2' as string]: ring2 }}
      >
        <div className={`cc-card-inner ${flip ? 'cc-flip' : ''}`}>
          {/* FRONT */}
          <section className="cc-front">
            <div className="flex items-center justify-between mb-8 relative z-10 shrink-0">
              <span className="text-sm font-semibold tracking-wide opacity-80">AgendAI</span>
              <CreditCard size={28} className="opacity-70" />
            </div>

            <div className="cc-number-row">
              {displayedSlots.map((slot, idx) => (
                <span key={idx} className="cc-slot">
                  <span className={`cc-digit ${slot.filed ? 'cc-filed' : ''}`}>
                    <span className="cc-row opacity-40">#</span>
                    <span className="cc-row">{slot.textTop}</span>
                  </span>
                </span>
              ))}
            </div>

            <div className="cc-card-footer">
              <div className="uppercase">
                <div className="text-[11px] font-semibold opacity-60 mb-1">Card Holder</div>
                <div className="text-sm font-medium tracking-wide">{holder || 'NAME ON CARD'}</div>
              </div>
              <div className="text-right">
                <div className="text-[11px] font-semibold opacity-60 mb-1">Expires</div>
                <div className="text-sm font-medium">
                  <span>{month || 'MM'}</span>/<span>{year ? year.slice(-2) : 'YY'}</span>
                </div>
              </div>
            </div>
          </section>

          {/* BACK */}
          <section className="cc-back">
            <div className="cc-hide-line" />
            <div className="cc-cvv-strip">
              <div className="cc-signature" />
              <div className="cc-cvv-row">
                <span className="cc-cvv-label">CVV</span>
                <div className="cc-cvv-field">{cvv || ''}</div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* FORM */}
      <form
        className="mt-6 grid gap-3 bg-surface border border-border rounded-2xl p-5"
        onSubmit={handleSubmit}
        noValidate
      >
        <div>
          <label
            htmlFor="cc-number"
            className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-1 block"
          >
            Número do cartão
          </label>
          <input
            id="cc-number"
            className={inputClass}
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="0000 0000 0000 0000"
            value={formatNumberSpaces(number)}
            onChange={e => setNumber(clampDigits(e.target.value, 19))}
            onFocus={() => setFocusField('number')}
            onBlur={() => setFocusField(null)}
            aria-invalid={!validity.number}
          />
          {!validity.number && number.length >= 13 && (
            <span className="text-[10px] text-danger mt-1 block">Número do cartão inválido</span>
          )}
        </div>

        <div>
          <label
            htmlFor="cc-name"
            className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-1 block"
          >
            Nome impresso
          </label>
          <input
            id="cc-name"
            className={inputClass}
            type="text"
            autoComplete="cc-name"
            placeholder="COMO APARECE NO CARTÃO"
            value={holder}
            onChange={e => setHolder(e.target.value.toUpperCase())}
            onFocus={() => setFocusField('holder')}
            onBlur={() => setFocusField(null)}
            aria-invalid={!validity.holder}
          />
        </div>

        <div className="grid grid-cols-[2fr_1fr] gap-3">
          <div>
            <label
              htmlFor="cc-month"
              className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-1 block"
            >
              Validade
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                className={inputClass}
                value={month || ''}
                onChange={e => setMonth(e.target.value)}
                onFocus={() => setFocusField('expire')}
                onBlur={() => setFocusField(null)}
                aria-invalid={!validity.month}
              >
                <option value="" disabled>
                  Mês
                </option>
                {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(m => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                className={inputClass}
                value={year || ''}
                onChange={e => setYear(e.target.value)}
                onFocus={() => setFocusField('expire')}
                onBlur={() => setFocusField(null)}
                aria-invalid={!validity.year}
              >
                <option value="" disabled>
                  Ano
                </option>
                {years.map(y => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label
              htmlFor="cc-cvv"
              className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-1 block"
            >
              CVV
            </label>
            <input
              id="cc-cvv"
              className={inputClass}
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="***"
              value={cvv}
              onChange={e => setCVV(clampDigits(e.target.value, 4))}
              onFocus={() => setFocusField('cvv')}
              onBlur={() => setFocusField(null)}
              aria-invalid={!validity.cvv}
            />
          </div>
        </div>

        {showSubmit && (
          <button
            type="submit"
            disabled={!validity.allValid}
            className="w-full py-3.5 rounded-xl bg-accent text-accent-fg font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-accent-hover transition-colors disabled:opacity-50 cursor-pointer"
          >
            {validity.allValid ? submitLabel : 'Preencha todos os campos'}
          </button>
        )}
      </form>
    </section>
  );
};

export { CreditCardForm };
export type { CardState, CardValidity };
