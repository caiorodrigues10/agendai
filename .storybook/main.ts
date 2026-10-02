import type { StorybookConfig } from '@storybook/react-vite';

// Sinaliza para vite.config.ts que este é um build/dev do Storybook
// (o app PWA não deve registrar service worker no preview estático).
process.env.STORYBOOK = 'true';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-mcp',
  ],
  framework: '@storybook/react-vite',
};

export default config;
