import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { LuCalendarDays, LuListTodo, LuUsers } from 'react-icons/lu';
import { Tabs, TabItem } from './Tabs';

const meta = {
  title: 'Padrões/Tabs',
  component: Tabs,
  tags: ['autodocs', 'test'],
  parameters: { layout: 'centered' },
  args: {
    items: [{ id: 'hoje', label: 'Hoje' }],
    value: 'hoje',
    onChange: fn(),
    ariaLabel: 'Seções',
  },
} satisfies Meta<typeof Tabs>;
export default meta;
type Story = StoryObj<typeof meta>;

const items: TabItem[] = [
  { id: 'hoje', label: 'Hoje' },
  { id: 'fila', label: 'Fila' },
  { id: 'agenda', label: 'Agenda' },
  { id: 'clientes', label: 'Clientes' },
];

/** Aba + tabpanels correspondentes (aria-controls exige ids reais — D-005). */
function TabsDemo({ items: list, value, onChange, ariaLabel }: {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  ariaLabel: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <Tabs ariaLabel={ariaLabel} items={list} value={value} onChange={onChange} />
      {list.map(item => (
        <div
          key={item.id}
          role="tabpanel"
          id={`tabpanel-${item.id}`}
          aria-labelledby={`tab-${item.id}`}
          hidden={item.id !== value}
          className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-secondary"
        >
          Conteúdo da aba {item.label}.
        </div>
      ))}
    </div>
  );
}

export const Default: Story = {
  render: () => {
    const [tab, setTab] = useState('hoje');
    return <TabsDemo ariaLabel="Seções do painel" items={items} value={tab} onChange={setTab} />;
  },
};

export const WithIcons: Story = {
  render: () => {
    const [tab, setTab] = useState('agenda');
    return (
      <TabsDemo
        ariaLabel="Seções com ícones"
        items={[
          { id: 'hoje', label: 'Hoje', icon: <LuListTodo size={16} /> },
          { id: 'agenda', label: 'Agenda', icon: <LuCalendarDays size={16} /> },
          { id: 'clientes', label: 'Clientes', icon: <LuUsers size={16} /> },
        ]}
        value={tab}
        onChange={setTab}
      />
    );
  },
};

export const WithDisabled: Story = {
  render: () => {
    const [tab, setTab] = useState('hoje');
    return (
      <TabsDemo
        ariaLabel="Seções com item desabilitado"
        items={[
          ...items.slice(0, 3),
          { id: 'relatorios', label: 'Relatórios', disabled: true },
        ]}
        value={tab}
        onChange={setTab}
      />
    );
  },
};
