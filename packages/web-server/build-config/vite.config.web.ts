import path from 'node:path'

import type { UserConfig } from 'vite'

const isProd = process.env.NODE_ENV == 'production'
const rootPath = path.join(__dirname, '../../../')
const projectPath = path.join(rootPath, 'packages/web-server')

export const buildConfig = (mode: string): UserConfig => {
  return {
    mode,
    root: projectPath,
    base: './',
    publicDir: false,
    logLevel: 'warn',
    resolve: {
      alias: {
        '@': path.join(projectPath, 'src'),
      },
    },
    build: {
      target: 'esnext',
      // lib: {
      //   entry: 'src/index.ts',
      //   formats: ['cjs'],
      //   fileName: 'main',
      // },
      outDir: isProd ? path.join(rootPath, 'build/public') : path.join(projectPath, 'server/public'),
      emptyOutDir: false,
      reportCompressedSize: false,
      modulePreload: false,
      // assetsDir: 'chunks',
      sourcemap: true,
      minify: isProd,
      watch: isProd
        ? null
        : {
            buildDelay: 500,
          },
      // commonjsOptions: {
      //   dynamicRequireTargets: ['*.js'],
      //   ignoreDynamicRequires: true,
      // },
      rolldownOptions: {
        input: {
          'view-main.ipc': path.join(projectPath, 'src/app/renderer/winMain/preload/index.ts'),
        },
        output: {
          entryFileNames: isProd ? '[name].[hash].js' : '[name].js',
          chunkFileNames: '[name].js',
          format: 'esm',
          // experimentalMinChunkSize: 50_000,
        },
        logLevel: 'warn',
      },
    },
    define: {
      'process.env.NODE_ENV': `"${process.env.NODE_ENV!}"`,
      // __QRC_DECODE_NODE_PATH__: `"${(isProd ? '../../build/Release' : path.join(rootPath, 'build/Release')).replace(/\\/g, '\\\\')}"`,
    },
    // cacheDir: path.join(rootPath, 'node_modules/.vite/main'),
  }
}
