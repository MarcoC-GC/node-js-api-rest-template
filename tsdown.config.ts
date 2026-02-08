import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts'],
  target: 'node24', // O la versión de Node que uses
  clean: true, // Limpia la carpeta dist antes de cada build
  unbundle: false, // Une los archivos para evitar el error de "directory import"
  skipNodeModulesBundle: true, // No intentes resolver node_modules
  alias: {
    '@': './src' // Mapea tu alias de TS aquí también
  },
  minify: true, // Minifica el código de salida
  platform: 'node'
})
