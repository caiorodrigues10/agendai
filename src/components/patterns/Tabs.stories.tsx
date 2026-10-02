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

export const Default: Story = {
  render: () => {
    const [tab, setTab] = useState('hoje');
    return <Tabs ariaLabel="Seções do painel" items={items} value={tab} onChange={setTab} />;
  },
};

export const WithIcons: Story = {
  render: () => {
    const [tab, setTab] = useState('agenda');
    return (
      <Tabs
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
      <Tabs
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
