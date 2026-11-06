// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import prettierConfig from 'eslint-config-prettier';

// S9 — regra interna: <a target="_blank"> precisa de rel com "noopener"
// (previne tab-nabbing). Literais são validados; rel em expressão passa
// (não determinístico estaticamente).
const internalPlugin = {
  rules: {
    'no-unsafe-blank': {
      meta: {
        type: 'problem',
        docs: { description: 'exige rel com "noopener" em <a target="_blank">' },
        messages: {
          missing: 'target="_blank" precisa de rel contendo "noopener" (tab-nabbing).',
        },
        schema: [],
      },
      create(context) {
        return {
          JSXOpeningElement(node) {
            if (node.name.name !== 'a') return;
            const attrs = node.attributes.filter((a) => a.type === 'JSXAttribute');
            const target = attrs.find((a) => a.name.name === 'target');
            if (!target || target.value?.type !== 'Literal' || target.value.value !== '_blank') {
              return;
            }
            const rel = attrs.find((a) => a.name.name === 'rel');
            if (!rel) {
              context.report({ node, messageId: 'missing' });
              return;
            }
            if (
              rel.value?.type === 'Literal' &&
              typeof rel.value.value === 'string' &&
              !rel.value.value.includes('noopener')
            ) {
              context.report({ node, messageId: 'missing' });
            }
          },
        };
      },
    },
  },
};

export default tseslint.config({
  ignores: [
    'dist/',
    'node_modules/',
    'graphify-out/',
    'storybook-static/',
    'scripts/',
    'public/',
    '*.config.js',
    '*.config.ts',
    'coverage/',
    '.vite/',
    '*.stackdump',
  ],
}, js.configs.recommended, ...tseslint.configs.recommended, ...tseslint.configs.stylistic, {
  plugins: {
    'react-hooks': reactHooksPlugin,
    'jsx-a11y': jsxA11yPlugin,
    'internal': internalPlugin,
  },
  rules: {
    ...reactHooksPlugin.configs['recommended-latest'].rules,
    ...jsxA11yPlugin.configs.recommended.rules,
    ...prettierConfig.rules,
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-empty-function': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'jsx-a11y/anchor-is-valid': 'off',
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/no-static-element-interactions': 'warn',
    'jsx-a11y/label-has-associated-control': 'warn',
    'jsx-a11y/no-autofocus': 'warn',
    'jsx-a11y/autocomplete-valid': 'warn',
    'internal/no-unsafe-blank': 'error',
    'no-empty': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'react-hooks/set-state-in-effect': 'warn',
    'react-hooks/refs': 'warn',
    'max-lines': ['warn', { max: 500, skipBlankLines: true, skipComments: true }],
    'max-lines-per-function': ['warn', { max: 180, skipBlankLines: true, skipComments: true }],
    complexity: ['warn', 20],
  },
  languageOptions: {
    parserOptions: {
      ecmaFeatures: { jsx: true },
      project: './tsconfig.json',
      tsconfigRootDir: import.meta.dirname,
    },
  },
  settings: {
    react: { version: '18.3' },
  },
}, {
  files: ['server/**/*.js'],
  languageOptions: {
    globals: {
      console: 'readonly',
      process: 'readonly',
      require: 'readonly',
      module: 'readonly',
      exports: 'readonly',
      __dirname: 'readonly',
      __filename: 'readonly',
      Buffer: 'readonly',
      setTimeout: 'readonly',
      clearTimeout: 'readonly',
      setInterval: 'readonly',
      clearInterval: 'readonly',
    },
  },
}, {
  files: ['src/components/ui/**/*.{ts,tsx}'],
  rules: {
    'no-restricted-imports': [
      'warn',
      {
        patterns: [
          {
            group: ['../../infra/*', '../../../infra/*', '@/infra/*'],
            message:
              'Componentes de UI não podem depender da camada HTTP. Use uma feature ou hook de domínio.',
          },
        ],
      },
    ],
  },
}, storybook.configs["flat/recommended"]);
