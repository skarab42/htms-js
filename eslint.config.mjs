import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import gitignore from 'eslint-config-flat-gitignore';
import prettier from 'eslint-config-prettier/flat';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import ts from 'typescript-eslint';

export default defineConfig([
  gitignore(),
  { linterOptions: { reportUnusedInlineConfigs: 'warn' } },
  js.configs.recommended,
  unicorn.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
  ts.configs.strict,
  ts.configs.stylistic,
  {
    files: ['**/*.{ts,mts,cts}'],
    languageOptions: {
      parserOptions: {
        sourceType: 'module',
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  prettier,
]);
