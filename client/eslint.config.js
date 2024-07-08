import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';

import prettierConfig from './prettier.config.js';

export default [
  // eslintPluginReact.configs.recommended,
  // eslintPluginReactHooks.configs.recommended,
  {
    plugins: {
      import: eslintPluginImport,
      prettier: eslintPluginPrettier,
      react: eslintPluginReact,
      'react-hooks': eslintPluginReactHooks,
    },
    rules: {
      'prettier/prettier': ['warn', prettierConfig],
      'react/jsx-uses-react': 'off',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/exhaustive-deps': 'error',
      eqeqeq: 'warn',
      'guard-for-in': 'error',
      'no-console': 'off',
      'import/no-anonymous-default-export': 'off',
      'no-multiple-empty-lines': ['warn', { max: 1 }],
      'no-duplicate-imports': 'warn',
      'no-shadow': ['error', { ignoreOnInitialization: true }],
      'no-var': 'error',
      'object-shorthand': 'warn',
      'one-var': ['warn', 'never'],
      'prefer-const': 'warn',
      'prefer-template': 'warn',
      'require-await': 'off',
      'sort-imports': ['warn', { ignoreDeclarationSort: true }],
      'spaced-comment': ['warn', 'always', { markers: ['/'] }],
      'import/first': 'warn',
      'import/newline-after-import': 'warn',
      'import/order': [
        'warn',
        {
          'newlines-between': 'always',
          groups: ['builtin', 'external', ['internal', 'parent'], 'sibling', 'index'],
          pathGroups: [
            { pattern: 'vite', group: 'external', position: 'before' },
            { pattern: 'vitest', group: 'external', position: 'before' },
            { pattern: '{react,react-dom,react-dom/*}', group: 'external', position: 'before' },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          alphabetize: { order: 'asc', caseInsensitive: false },
        },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: ['./tsconfig.json', './tsconfig.node.json'],
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
    },
    rules: {
      ...typescriptPlugin.configs['recommended-type-checked'].rules,
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-use-before-define': ['error', 'nofunc'],
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/require-await': 'warn',
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
];
