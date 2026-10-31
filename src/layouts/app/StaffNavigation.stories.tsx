import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { StaffNavigation } from './StaffNavigation';
import { TAB_GROUPS } from '../../config/tabRegistry';
import { PageHeader } from '../../components/patterns';

const meta = {
  title: 'Painel/Navegação',
  component: StaffNavigation,
  tags: ['test'],
  args: {
    activeTab: 'overview',
    userRole: 'OWNER',
    hasDashboard: true,
    operationMode: 'HYBRID',
    onNavigate: () => {},
  },
  render: args => {
    const [tab, setTab] = useState(args.activeTab);
    return (
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 pb-28 lg:px-6">
        <StaffNavigation {...args} activeTab={tab} onNavigate={setTab} />
        <main className="min-w-0 flex-1">
          <PageHeader
            as="h1"
            title={
              TAB_GROUPS.flatMap(group => group.tabs).find(item => item.id === tab)?.label ?? tab
            }
            description="Prévia da navegação. Os conteúdos de cada área têm suas próprias stories."
          />
        </main>
      </div>
    );
  },
} satisfies Meta<typeof StaffNavigation>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Proprietario: Story = {};
export const Funcionario: Story = {
  args: {
    userRole: 'EMPLOYEE',
    permissions: ['RETAIL_SELL', 'FINANCE_VIEW', 'REPORTS_VIEW'],
    operationMode: 'QUEUE_ONLY',
  },
};
export const SemDashboard: Story = { args: { hasDashboard: false } };
