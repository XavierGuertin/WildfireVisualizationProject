const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');
const { fixupConfigRules } = require('@eslint/compat');
const nx = require('@nx/eslint-plugin');

const nextCompat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

// Get the Next.js recommended configs as arrays
const nextConfig = fixupConfigRules(nextCompat.extends('next'));
const nextCoreConfig = fixupConfigRules(nextCompat.extends('next/core-web-vitals'));

// Get Nx base configs (assumed to be arrays)
const nxBaseConfigs = [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
];

module.exports = [
  // Nx base configuration for all files
  ...nxBaseConfigs,

  // Global ignore patterns
  {
    ignores: ['**/dist'],
  },

  // Global settings for all JS/TS files (e.g. enforcing module boundaries)
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },

  // Include Next.js recommended settings for frontend files.
  // These are arrays of config objects so we spread them into the top-level array.
  ...nextConfig,
  ...nextCoreConfig,

  // Frontend-specific override: disable the problematic rule.
  {
    files: ['apps/frontend/**/*.{ts,tsx,js,jsx}'],
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
      "@typescript-eslint/no-empty-function": "off"
    },
  },

  // Optionally, any additional global overrides
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      // Add any further global rule adjustments here.
    },
  },
];
