import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { BarbershopContext } from '../../contexts/BarbershopContext';
import { SocialLinksSection } from './SocialLinksSection';
import type { SocialLinks } from '../../utils/socialLinks';

type ContextValue = React.ContextType<typeof BarbershopContext>;

const meta = {
  title: 'Features/Settings/SocialLinksSection',
  component: SocialLinksSection,
  tags: ['autodocs', 'test'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story, context) => {
      // Só o que a seção usa do contexto: o PATCH de socialLinks.
      const setSocialLinks = (context.parameters?.setSocialLinks ??
        (async () => null)) as ContextValue['setSocialLinks'];
      return (
        <BarbershopContext.Provider value={{ setSocialLinks } as ContextValue}>
          <div className="max-w-xl">
            <Story />
          </div>
        </BarbershopContext.Provider>
      );
    },
  ],
} satisfies Meta<typeof SocialLinksSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vazio: Story = {
  parameters: {
    setSocialLinks: async () => null,
  },
  args: {
    initialLinks: null,
    onNotify: () => undefined,
  },
};

const COM_CANONICO: SocialLinks = {
  instagram: 'https://instagram.com/barbeariacentral',
  x: 'https://x.com/barbeariacentral',
};

export const ComRedesSalvas: Story = {
  parameters: {
    setSocialLinks: async () => COM_CANONICO,
  },
  args: {
    initialLinks: COM_CANONICO,
    onNotify: () => undefined,
  },
};

export const LinkInvalido: Story = {
  parameters: {
    setSocialLinks: async () => null,
  },
  args: {
    initialLinks: { instagram: 'facebook.com/errado' },
    onNotify: () => undefined,
  },
};
