import React, { useState } from 'react';
import {
  AlertCircle,
  Bell,
  Check,
  CheckCircle,
  Info,
  Sparkles,
  X,
} from 'lucide-react';
import { Select } from '../components/ui/SmartSelect';

/* ------------------------------------------------------------------ */
/*  Palettes — cada painel define tokens CSS no escopo do container    */
/* ------------------------------------------------------------------ */

interface PanelDef {
  id: string;
  label: string;
  hex: string;
  usage: string;
  tokens: Record<string, string>;
}

const PANELS: PanelDef[] = [
  {
    id: 'cobre',
    label: 'A Cobre',
    hex: '#D9956C',
    usage: 'Acento quente, destaques em superfícies neutras.',
    tokens: {
      '--dl-accent': '#D9956C',
      '--dl-accent-hover': '#C4804F',
      '--dl-accent-fg': '#ffffff',
      '--dl-surface': '#faf6f2',
      '--dl-surface-2': '#f0e8df',
      '--dl-bg': '#fdfbf9',
      '--dl-border': '#e8ddd1',
      '--dl-border-strong': '#d4c4b0',
      '--dl-text-primary': '#2c1e12',
      '--dl-text-secondary': '#6b5a4a',
      '--dl-text-muted': '#9a8878',
      '--dl-support': '#D9956C',
      '--dl-danger': '#c0392b',
      '--dl-selection': 'rgba(217,149,108,0.15)',
    },
  },
  {
    id: 'mineral',
    label: 'B Mineral',
    hex: '#A6ABA5',
    usage: 'Neutro frio, bordas, fundos secundários.',
    tokens: {
      '--dl-accent': '#A6ABA5',
      '--dl-accent-hover': '#8e948d',
      '--dl-accent-fg': '#ffffff',
      '--dl-surface': '#f7f8f7',
      '--dl-surface-2': '#ecedec',
      '--dl-bg': '#fafbfa',
      '--dl-border': '#dfe0df',
      '--dl-border-strong': '#c8c9c8',
      '--dl-text-primary': '#1a1c1a',
      '--dl-text-secondary': '#555855',
      '--dl-text-muted': '#7e817e',
      '--dl-support': '#6b8f71',
      '--dl-danger': '#c0392b',
      '--dl-selection': 'rgba(166,171,165,0.18)',
    },
  },
  {
    id: 'coral',
    label: 'C Coral',
    hex: '#DA918B',
    usage: 'Alertas suaves, badges de atenção, CTAs secundários.',
    tokens: {
      '--dl-accent': '#DA918B',
      '--dl-accent-hover': '#c47770',
      '--dl-accent-fg': '#ffffff',
      '--dl-surface': '#fdf6f5',
      '--dl-surface-2': '#f5e8e6',
      '--dl-bg': '#fefafa',
      '--dl-border': '#ecd5d3',
      '--dl-border-strong': '#d4b5b2',
      '--dl-text-primary': '#2c1513',
      '--dl-text-secondary': '#6b4a47',
      '--dl-text-muted': '#9a7875',
      '--dl-support': '#DA918B',
      '--dl-danger': '#c0392b',
      '--dl-selection': 'rgba(218,145,139,0.15)',
    },
  },
  {
    id: 'petroleo',
    label: 'D Petróleo',
    hex: '#86B6C2',
    usage: 'Links, ícones interativos, elementos de navegação.',
    tokens: {
      '--dl-accent': '#86B6C2',
      '--dl-accent-hover': '#6a9eac',
      '--dl-accent-fg': '#ffffff',
      '--dl-surface': '#f4f8f9',
      '--dl-surface-2': '#e6edef',
      '--dl-bg': '#f9fbfc',
      '--dl-border': '#d4dee1',
      '--dl-border-strong': '#b5c5ca',
      '--dl-text-primary': '#122428',
      '--dl-text-secondary': '#456268',
      '--dl-text-muted': '#73929a',
      '--dl-support': '#86B6C2',
      '--dl-danger': '#c0392b',
      '--dl-selection': 'rgba(134,182,194,0.15)',
    },
  },
  {
    id: 'verde-equilibrado',
    label: 'E Verde Equilibrado',
    hex: '#5B8F72',
    usage: 'Verde de marca mais sereno, com presença sem dominar a interface.',
    tokens: {
      '--dl-accent': '#5B8F72',
      '--dl-accent-hover': '#47755C',
      '--dl-accent-fg': '#ffffff',
      '--dl-surface': '#f6f8f5',
      '--dl-surface-2': '#e9eee9',
      '--dl-bg': '#fbfcfa',
      '--dl-border': '#d9e2d9',
      '--dl-border-strong': '#b9c9bc',
      '--dl-text-primary': '#18251c',
      '--dl-text-secondary': '#4f6154',
      '--dl-text-muted': '#77857a',
      '--dl-support': '#88A996',
      '--dl-danger': '#c0392b',
      '--dl-selection': 'rgba(91,143,114,0.15)',
    },
  },
];

/* ------------------------------------------------------------------ */
/*  SmartSelect options                                                */
/* ------------------------------------------------------------------ */

const SELECT_OPTIONS = [
  { value: 'op1', label: 'Corte masculino' },
  { value: 'op2', label: 'Barba' },
  { value: 'op3', label: 'Pigmentação' },
  { value: 'op4', label: 'Sobrancelha' },
  { value: 'op5', label: 'Hidratação capilar' },
] as const;

/* ------------------------------------------------------------------ */
/*  Tab definitions                                                    */
/* ------------------------------------------------------------------ */

const TABS = [
  { id: 'tab1', label: 'Geral' },
  { id: 'tab2', label: 'Agenda' },
  { id: 'tab3', label: 'Financeiro' },
];

/* ------------------------------------------------------------------ */
/*  ColorSwatch — small color box with label                           */
/* ------------------------------------------------------------------ */

const ColorSwatch: React.FC<{
  color: string;
  label: string;
  sublabel?: string;
}> = ({ color, label, sublabel }) => (
  <div className="flex items-center gap-2">
    <span
      className="inline-block h-6 w-6 rounded-md border border-[var(--dl-border)]"
      style={{ backgroundColor: color }}
    />
    <span className="text-xs text-[var(--dl-text-secondary)]">
      {label}
      {sublabel ? (
        <span className="ml-1 font-mono text-[var(--dl-text-muted)]">{sublabel}</span>
      ) : null}
    </span>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Panel component                                                    */
/* ------------------------------------------------------------------ */

const Panel: React.FC<{ panel: PanelDef }> = ({ panel }) => {
  const [activeTab, setActiveTab] = useState('tab1');
  const [selectValue, setSelectValue] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [showNotification, setShowNotification] = useState(true);

  const t = panel.tokens;

  return (
    <section
      className="flex flex-col gap-5 rounded-2xl border p-5 sm:p-6"
      style={{
        ...t,
        backgroundColor: t['--dl-bg'],
        borderColor: t['--dl-border'],
      }}
    >
      {/* Header */}
      <header className="flex flex-wrap items-baseline gap-2">
        <h2
          className="text-lg font-bold font-[family-name:var(--font-display)]"
          style={{ color: t['--dl-text-primary'] }}
        >
          {panel.label}
        </h2>
        <span
          className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold"
          style={{
            backgroundColor: t['--dl-accent'],
            color: t['--dl-accent-fg'],
            borderColor: t['--dl-accent'],
          }}
        >
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: t['--dl-accent-fg'], opacity: 0.6 }}
          />
          {panel.hex}
        </span>
        <span
          className="text-xs"
          style={{ color: t['--dl-text-muted'] }}
        >
          {panel.usage}
        </span>
      </header>

      {/* ── Buttons ──────────────────────────────────────────── */}
      <div className="space-y-3">
        <p
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: t['--dl-text-muted'] }}
        >
          Botões
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {/* Primário neutro (surface) */}
          <button
            type="button"
            className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              backgroundColor: t['--dl-surface-2'],
              color: t['--dl-text-primary'],
              borderColor: t['--dl-border-strong'],
              '--tw-ring-color': t['--dl-accent'],
            } as React.CSSProperties}
          >
            Neutro
          </button>

          {/* Marca verde (accent global — brand) */}
          <button
            type="button"
            className="rounded-lg border border-transparent px-4 py-2 text-sm font-medium transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              backgroundColor: 'var(--ag-accent)',
              color: 'var(--ag-accent-fg)',
              '--tw-ring-color': 'var(--ag-accent)',
            } as React.CSSProperties}
          >
            Marca Verde
          </button>

          {/* Secundário contornado */}
          <button
            type="button"
            className="rounded-lg border bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              color: t['--dl-accent'],
              borderColor: t['--dl-accent'],
              '--tw-ring-color': t['--dl-accent'],
            } as React.CSSProperties}
          >
            Secundário
          </button>

          {/* Terciário ghost */}
          <button
            type="button"
            className="rounded-lg border border-transparent bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              color: t['--dl-text-secondary'],
              '--tw-ring-color': t['--dl-accent'],
            } as React.CSSProperties}
          >
            Terciário
          </button>

          {/* Destaque support */}
          <button
            type="button"
            className="rounded-lg border border-transparent px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              backgroundColor: t['--dl-support'],
              '--tw-ring-color': t['--dl-support'],
            } as React.CSSProperties}
          >
            Support
          </button>

          {/* Danger */}
          <button
            type="button"
            className="rounded-lg border border-transparent px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              backgroundColor: t['--dl-danger'],
              '--tw-ring-color': t['--dl-danger'],
            } as React.CSSProperties}
          >
            Danger
          </button>

          {/* Disabled */}
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-lg border border-transparent bg-gray-300 px-4 py-2 text-sm font-medium text-gray-500 opacity-50"
          >
            Disabled
          </button>
        </div>

        {/* States legend */}
        <p className="text-[11px]" style={{ color: t['--dl-text-muted'] }}>
          Estados: <span className="font-medium">hover</span> (opacidade reduzida) ·{' '}
          <span className="font-medium">focus</span> (ring accent) ·{' '}
          <span className="font-medium">disabled</span> (opacity 50%, cursor not-allowed)
        </p>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────── */}
      <div className="space-y-3">
        <p
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: t['--dl-text-muted'] }}
        >
          Abas
        </p>
        <div
          className="inline-flex gap-1 rounded-lg p-1"
          style={{ backgroundColor: t['--dl-surface-2'] }}
          role="tablist"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className="rounded-md px-3.5 py-1.5 text-sm font-medium transition-all focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: isActive ? t['--dl-accent'] : 'transparent',
                  color: isActive ? t['--dl-accent-fg'] : t['--dl-text-secondary'],
                  '--tw-ring-color': t['--dl-accent'],
                } as React.CSSProperties}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Badge ─────────────────────────────────────────────── */}
      <div className="space-y-3">
        <p
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: t['--dl-text-muted'] }}
        >
          Badges
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium"
            style={{
              borderColor: t['--dl-accent'],
              backgroundColor: t['--dl-selection'],
              color: t['--dl-accent'],
            }}
          >
            <Check className="h-3 w-3" />
            Confirmado
          </span>
          <span
            className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium"
            style={{
              borderColor: t['--dl-support'],
              backgroundColor: t['--dl-selection'],
              color: t['--dl-support'],
            }}
          >
            <Info className="h-3 w-3" />
            Pendente
          </span>
          <span
            className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium"
            style={{
              borderColor: t['--dl-danger'],
              backgroundColor: 'rgba(192,57,43,0.1)',
              color: t['--dl-danger'],
            }}
          >
            <AlertCircle className="h-3 w-3" />
            Cancelado
          </span>
        </div>
      </div>

      {/* ── Input ─────────────────────────────────────────────── */}
      <div className="space-y-3">
        <p
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: t['--dl-text-muted'] }}
        >
          Input
        </p>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Digite algo..."
          className="w-full rounded-lg border bg-transparent px-4 py-3 text-sm outline-none transition-colors focus:ring-2 disabled:opacity-70"
          style={{
            borderColor: t['--dl-border'],
            color: t['--dl-text-primary'],
            '--tw-ring-color': t['--dl-accent'],
          } as React.CSSProperties}
        />
        <input
          type="text"
          disabled
          value="Campo desabilitado"
          className="w-full cursor-not-allowed rounded-lg border bg-transparent px-4 py-3 text-sm opacity-50"
          style={{
            borderColor: t['--dl-border'],
            color: t['--dl-text-muted'],
          }}
        />
      </div>

      {/* ── SmartSelect ───────────────────────────────────────── */}
      <div className="space-y-3">
        <p
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: t['--dl-text-muted'] }}
        >
          SmartSelect
        </p>
        <div
          className="[&_[data-smart-select]]:rounded-lg [&_[data-smart-select]]:border [&_[data-smart-select]]:bg-transparent [&_[data-smart-select]]:text-sm"
          style={
            {
              '--dl-border': t['--dl-border'],
              '--dl-text-primary': t['--dl-text-primary'],
              '--dl-text-muted': t['--dl-text-muted'],
              '--dl-accent': t['--dl-accent'],
              '--dl-surface': t['--dl-surface'],
              '--dl-surface-2': t['--dl-surface-2'],
            } as React.CSSProperties
          }
        >
          <Select
            options={[...SELECT_OPTIONS]}
            value={selectValue}
            onChange={setSelectValue}
            placeholder="Selecionar serviço..."
            searchable
            clearable
          />
        </div>
      </div>

      {/* ── Notification ──────────────────────────────────────── */}
      <div className="space-y-3">
        <p
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: t['--dl-text-muted'] }}
        >
          Notificação visual
        </p>
        {showNotification ? (
          <div
            className="flex items-start gap-3 rounded-xl border p-4"
            style={{
              backgroundColor: t['--dl-surface'],
              borderColor: t['--dl-border'],
            }}
          >
            <div
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: t['--dl-selection'] }}
            >
              <Bell
                className="h-4 w-4"
                style={{ color: t['--dl-accent'] }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-semibold"
                style={{ color: t['--dl-text-primary'] }}
              >
                Novo agendamento confirmado
              </p>
              <p
                className="mt-0.5 text-xs"
                style={{ color: t['--dl-text-muted'] }}
              >
                Carlos Silva — Amanhã às 14:30 · Corte + Barba
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowNotification(false)}
              className="shrink-0 rounded-md p-1 transition-opacity hover:opacity-70 focus:outline-none focus:ring-2"
              style={{
                color: t['--dl-text-muted'],
                '--tw-ring-color': t['--dl-accent'],
              } as React.CSSProperties}
              aria-label="Fechar notificação"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowNotification(true)}
            className="rounded-lg border bg-transparent px-3 py-1.5 text-xs font-medium transition-colors hover:opacity-80 focus:outline-none focus:ring-2"
            style={{
              borderColor: t['--dl-border-strong'],
              color: t['--dl-text-secondary'],
              '--tw-ring-color': t['--dl-accent'],
            } as React.CSSProperties}
          >
            Reexibir notificação
          </button>
        )}
      </div>

      {/* ── Token Legend ──────────────────────────────────────── */}
      <div className="space-y-2">
        <p
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: t['--dl-text-muted'] }}
        >
          Paleta deste painel
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3">
          <ColorSwatch color={t['--dl-accent']} label="accent" sublabel={t['--dl-accent']} />
          <ColorSwatch color={t['--dl-accent-hover']} label="accent-hover" sublabel={t['--dl-accent-hover']} />
          <ColorSwatch color={t['--dl-support']} label="support" sublabel={t['--dl-support']} />
          <ColorSwatch color={t['--dl-surface']} label="surface" sublabel={t['--dl-surface']} />
          <ColorSwatch color={t['--dl-surface-2']} label="surface-2" sublabel={t['--dl-surface-2']} />
          <ColorSwatch color={t['--dl-bg']} label="bg" sublabel={t['--dl-bg']} />
          <ColorSwatch color={t['--dl-border']} label="border" sublabel={t['--dl-border']} />
          <ColorSwatch color={t['--dl-text-primary']} label="text-primary" sublabel={t['--dl-text-primary']} />
          <ColorSwatch color={t['--dl-text-secondary']} label="text-secondary" sublabel={t['--dl-text-secondary']} />
          <ColorSwatch color={t['--dl-text-muted']} label="text-muted" sublabel={t['--dl-text-muted']} />
          <ColorSwatch color={t['--dl-danger']} label="danger" sublabel={t['--dl-danger']} />
          <ColorSwatch color={t['--dl-selection']} label="selection" sublabel="rgba …" />
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const DesignLabPage: React.FC = () => (
  <div className="min-h-screen bg-bg px-4 py-10 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Page header */}
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-accent" />
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-text-primary">
            Design Lab
          </h1>
        </div>
        <p className="max-w-2xl text-sm text-text-secondary">
          Painel de desenvolvimento para validar alternativas de paleta. Cada bloco
          aplica CSS variables no escopo do container — o tema global não é alterado.
          Acesse em <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-xs">/design-lab</code>.
        </p>
      </header>

      {/* Global brand reference */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
          Marca global (production)
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <ColorSwatch color="var(--ag-accent)" label="accent (brand)" sublabel="#047857" />
          <ColorSwatch color="var(--ag-accent-hover)" label="accent-hover" sublabel="#065f46" />
          <ColorSwatch color="var(--ag-tertiary)" label="tertiary" sublabel="#79613f" />
          <ColorSwatch color="var(--ag-support)" label="support" sublabel="#3b82f6" />
          <ColorSwatch color="var(--ag-danger)" label="danger" sublabel="#dc2626" />
        </div>
      </div>

      {/* Panels grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {PANELS.map((panel) => (
          <Panel key={panel.id} panel={panel} />
        ))}
      </div>

      {/* Footer note */}
      <footer className="border-t border-border pt-4">
        <p className="text-xs text-text-muted">
          Design Lab · Nenhum dado real é consumido. Esta página não requer
          autenticação e não impacta o fluxo de produção.
        </p>
      </footer>
    </div>
  </div>
);

export default DesignLabPage;
