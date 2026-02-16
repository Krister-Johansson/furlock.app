//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'
import prettierConfig from 'eslint-config-prettier'

export default [
  {
    ignores: [
      'src/components/ui/**',
      '.output/**',
      'convex/_generated/**',
      'eslint.config.js',
      'prettier.config.js',
    ],
  },
  ...tanstackConfig,
  prettierConfig,
]
