// Regras do ESLint para a Academia (npm run lint). Corre no CI a seguir ao typecheck.
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/', 'public/', 'node_modules/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts', 'api/**/*.ts', 'tests/**/*.ts'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Promessas esquecidas: um erro dentro delas desaparece sem ninguém ver.
      // Para lançar de propósito sem esperar, escreve-se `void tarefa()`.
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { arguments: false, attributes: false } },
      ],
      // O tsconfig já recusa variáveis por usar; aqui só se aceita o prefixo _ para parâmetros obrigatórios.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',
    },
  },
  {
    // Camadas (docs/ARQUITETURA.md): só src/app/ conhece o estado global. ui/, engines/ e data/
    // recebem o que precisam por parâmetro, para se poderem testar sem montar a app inteira.
    files: ['src/ui/**/*.ts', 'src/engines/**/*.ts', 'src/data/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/app/*', '**/app', '**/main'],
              message: 'ui/, engines/ e data/ não importam de app/: recebe o estado ou as funções por parâmetro.',
            },
          ],
        },
      ],
    },
  },
  {
    // Nos testes os duplos (mocks do Worker, do DOM) não precisam de tipos completos.
    files: ['tests/**/*.ts'],
    rules: { '@typescript-eslint/no-explicit-any': 'off' },
  },
  {
    // O smoke E2E corre em Node, mas o código dentro de page.evaluate() corre no browser.
    files: ['scripts/**/*.mjs', 'eslint.config.js'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
);
