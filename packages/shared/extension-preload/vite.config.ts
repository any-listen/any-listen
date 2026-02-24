import path from 'node:path'
import type { UserConfig } from 'vite'
// import dts from 'vite-plugin-dts'

const isProd = process.env.NODE_ENV == 'production'
const rootPath = path.join(__dirname, '../../../')
const projectPath = path.join(rootPath, 'packages/shared/extension-preload')

const outputPath = {
  desktop: path.join(rootPath, 'packages/desktop/dist'),
  web: isProd ? path.join(rootPath, 'build/server') : path.join(rootPath, 'packages/web-server/server'),
  mobile: path.join(rootPath, 'packages/mobile/dist'),
} as const

type Target = keyof typeof outputPath

export const buildConfig = (target: Target): UserConfig => {
  return {
    mode: target,
    root: projectPath,
    base: './',
    publicDir: false,
    logLevel: 'warn',
    resolve: {
      alias: {
        '@': path.join(projectPath, 'src'),
      },
    },
    // plugins: [dts({
    //   declarationOnly: true,
    //   pathsToAliases: true,
    // })],
    build: {
      target: 'esnext',
      outDir: outputPath[target],
      modulePreload: false,
      emptyOutDir: false,
      reportCompressedSize: false,
      // assetsDir: 'chunks',
      assetsDir: './',
      sourcemap: false,
      minify: false,
      watch: isProd
        ? null
        : {
            buildDelay: 500,
          },
      rolldownOptions: {
        input: {
          'extension-preload': path.join(projectPath, 'src/index.ts'),
        },
        output: {
          entryFileNames: '[name].js',
          format: 'iife',
          // experimentalMinChunkSize: 50_000,
        },
        logLevel: 'warn',
      },
    },
  }
}
