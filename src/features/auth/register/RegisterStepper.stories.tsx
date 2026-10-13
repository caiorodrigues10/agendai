import type { Meta, StoryObj } from '@storybook/react-vite';
import { RegisterStepper, REGISTER_STEPS } from './RegisterStepper';

const meta = {
  title: 'Auth/RegisterStepper',
  component: RegisterStepper,
  tags: ['autodocs', 'test'],
  parameters: { layout: 'centered' },
  decorators: [story => <div className="w-[380px] bg-bg p-4 text-left">{story()}</div>],
  args: { steps: REGISTER_STEPS },
} satisfies Meta<typeof RegisterStepper>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Etapa1: Story = {
  args: { current: 1 },
};

export const Etapa2: Story = {
  args: { current: 2 },
};

export const Etapa3: Story = {
  args: { current: 3 },
};

/** Clique nas etapas concluídas: só voltar, nunca pular para frente. */
export const ComVoltarPorClique: Story = {
  args: { current: 3, onStepClick: () => undefined },
};
