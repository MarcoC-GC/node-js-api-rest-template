import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts'],
  target: 'node22',
  clean: true,
  unbundle: false,
  skipNodeModulesBundle: true,
  alias: {
    '@': './src'
  },
  minify: true,
  platform: 'node'
})
