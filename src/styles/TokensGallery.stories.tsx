import type { FC } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

interface TokenGroup {
  group: string;
  tokens: [label: string, cssVar: string][];
}

const colorGroups: TokenGroup[] = [
  {
    group: 'Superfícies e estrutura',
    tokens: [
      ['bg', '--ag-bg'],
      ['surface', '--ag-surface'],
      ['surface-2', '--ag-surface-2'],
      ['border', '--ag-border'],
      ['border-strong', '--ag-border-strong'],
    ],
  },
  {
    group: 'Texto',
    tokens: [
      ['text-primary', '--ag-text-primary'],
      ['text-secondary', '--ag-text-secondary'],
      ['text-muted', '--ag-text-muted'],
    ],
  },
  {
    group: 'Marca e ação',
    tokens: [
      ['brand', '--ag-brand'],
      ['brand-hover', '--ag-brand-hover'],
      ['action-primary', '--ag-action-primary'],
      ['action-primary-hover', '--ag-action-primary-hover'],
      ['action-primary-fg', '--ag-action-primary-fg'],
      ['accent (alias)', '--ag-accent'],
      ['accent-hover (alias)', '--ag-accent-hover'],
      ['accent-fg (alias)', '--ag-accent-fg'],
      ['action-secondary', '--ag-action-secondary'],
      ['selection', '--ag-selection'],
      ['focus', '--ag-focus'],
    ],
  },
  {
    group: 'Semânticas e apoio',
    tokens: [
      ['tertiary', '--ag-tertiary'],
      ['support', '--ag-support'],
      ['danger', '--ag-danger'],
      ['success', '--ag-success'],
      ['warning', '--ag-warning'],
    ],
  },
  {
    group: 'Charts (recharts/shadcn)',
    tokens: [
      ['chart-1', '--chart-1'],
      ['chart-2', '--chart-2'],
      ['chart-3', '--chart-3'],
      ['chart-4', '--chart-4'],
      ['chart-5', '--chart-5'],
    ],
  },
];

const Swatch: FC<{ label: string; cssVar: string }> = ({ label, cssVar }) => (
  <div className="flex flex-col gap-1">
    <div
      className="h-16 w-full rounded-xl border border-border"
      style={{ background: `var(${cssVar})` }}
      data-testid={`swatch-${label}`}
    />
    <span className="text-xs font-bold text-text-primary">{label}</span>
    <code className="text-[10px] text-text-muted">var({cssVar})</code>
  </div>
);

const TokensGallery: FC = () => (
  <div className="flex flex-col gap-8 p-6">
    <header className="flex flex-col gap-1">
      <h1 className="font-display text-2xl font-bold text-text-primary">Design tokens — Agende Já</h1>
      <p className="text-sm text-text-secondary">
        Fonte de verdade: <code className="text-text-muted">src/styles/tokens.css</code> (tema claro em{' '}
        <code className="text-text-muted">:root</code>, escuro em <code className="text-text-muted">.dark</code>).
        Use o seletor de tema na barra superior para alternar.
      </p>
    </header>

    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-bold uppercase tracking-wide text-text-muted">Tipografia</h2>
      <div className="grid gap-4 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2">
        <div>
          <p className="text-3xl font-bold text-text-primary">DM Sans — font-sans</p>
          <p className="text-sm text-text-secondary">Corpo, formulários e navegação do app.</p>
        </div>
        <div>
          <p className="font-display text-3xl font-bold text-text-primary">Syne — font-display</p>
          <p className="text-sm text-text-secondary">Títulos de marketing e destaques.</p>
        </div>
      </div>
    </section>

    {colorGroups.map(({ group, tokens }) => (
      <section key={group} className="flex flex-col gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-text-muted">{group}</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {tokens.map(([label, cssVar]) => (
            <Swatch key={cssVar} label={label} cssVar={cssVar} />
          ))}
        </div>
      </section>
    ))}

    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-bold uppercase tracking-wide text-text-muted">Semântica em uso</h2>
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-4">
        <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success">Concluído</span>
        <span className="rounded-full bg-warning/15 px-3 py-1 text-xs font-bold text-warning">Pendente</span>
        <span className="rounded-full bg-danger/15 px-3 py-1 text-xs font-bold text-danger">Cancelado</span>
        <span className="rounded-full bg-selection px-3 py-1 text-xs font-bold text-brand">Selecionado</span>
        <span className="rounded-full bg-support/15 px-3 py-1 text-xs font-bold text-support">Suporte</span>
      </div>
    </section>
  </div>
);

const meta = {
  title: 'Fundações/Tokens',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs', 'test'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Galeria: Story = {
  render: () => <TokensGallery />,
};
