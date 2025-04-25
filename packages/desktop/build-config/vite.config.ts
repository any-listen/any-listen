import electron from 'electron'
import { execSync, spawn } from 'node:child_process'
import { builtinModules } from 'node:module'
import path from 'node:path'
import type { UserConfig } from 'vite'

const isProd = process.env.NODE_ENV == 'production'
const rootPath = path.join(__dirname, '../../../')
const projectPath = path.join(rootPath, 'packages/desktop')

export { Arch } from 'electron-builder'
export { default as replaceLib } from './build-before-pack.cjs'

export const runDesktop = (onLog: (data: Buffer, color: 'red' | 'blue') => void) => {
  let args = [
    '--inspect=5858',
    // 'NODE_ENV=development',
    path.join(projectPath, 'dist/electron/main.js'),
  ]

  // detect yarn or npm and process commandline args accordingly
  if (process.env.npm_execpath?.endsWith('yarn.js')) {
    args = args.concat(process.argv.slice(3))
  } else if (process.env.npm_execpath?.endsWith('npm-cli.js')) {
    args = args.concat(process.argv.slice(2))
  } else if (process.env.npm_execpath?.endsWith('pnpm.cjs')) {
    args = args.concat(process.argv.slice(2))
  }

  const electronProcess = spawn(electron as unknown as string, args, {
    env: {
      NODE_OPTIONS: '--enable-source-maps',
    },
  })

  electronProcess.stdout.on('data', (data: Buffer) => {
    onLog(data, 'blue')
  })
  electronProcess.stderr.on('data', (data: Buffer) => {
    onLog(data, 'red')
  })

  electronProcess.on('close', () => {
    process.exit()
  })

  return electronProcess
}

let external = [
  'electron',
  // 'undici',
  // 'electron-log',
  // 'better-sqlite3',
  'font-list',
  // 'electron-font-manager',
  ...builtinModules.flatMap((m) => [m, `node:${m}`]),
]
// if (!isProd) external = [...external, 'undici']

const gitInfo = {
  commit_id: '',
  commit_date: '',
}

try {
  if (!execSync('git status --porcelain').toString().trim()) {
    gitInfo.commit_id = execSync('git log -1 --pretty=format:"%H"').toString().trim()
    gitInfo.commit_date = execSync('git log -1 --pretty=format:"%ad" --date=iso-strict').toString().trim()
  } else if (process.env.IS_CI) {
    throw new Error('Working directory is not clean')
  }
} catch {
  /* empty */
}

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
      conditions: ['module', 'node', 'default', 'development|production'],
      mainFields: ['module', 'jsnext:main', 'jsnext'],
    },
    build: {
      target: 'node20',
      lib: {
        entry: `src/${isProd ? 'index.ts' : 'index-dev.ts'}`,
        formats: ['cjs'],
        fileName: 'main',
      },
      outDir: path.join(projectPath, 'dist/electron'),
      emptyOutDir: false,
      reportCompressedSize: false,
      modulePreload: false,
      // assetsDir: 'chunks',
      sourcemap: !isProd,
      minify: false,
      watch: isProd
        ? null
        : {
            buildDelay: 500,
          },
      commonjsOptions: {
        // dynamicRequireTargets: ['*.js'],
        ignoreDynamicRequires: true,
      },
      rollupOptions: {
        external,
        input: {
          main: path.join(projectPath, `src/${isProd ? 'index.ts' : 'index-dev.ts'}`),
          'db-service.worker': path.join(rootPath, 'packages/shared/app/modules/worker/dbService/index.ts'),
          'util-service.worker': path.join(rootPath, 'packages/shared/app/modules/worker/utilService/index.ts'),
          'extension-service.worker': path.join(rootPath, 'packages/shared/app/modules/worker/extensionService/index.ts'),
          'view-main.preload': path.join(projectPath, 'src/renderer/winMain/preload/index.ts'),
        },
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          format: 'cjs',
          // manualChunks(id, info) {
          // //   return 'main'
          // },
          experimentalMinChunkSize: 50_000,
        },
        logLevel: 'warn',
      },
    },
    define: {
      'process.env.NODE_ENV': `"${process.env.NODE_ENV!}"`,
      __STATIC_PATH__: `"${path.join(projectPath, 'src/static').replace(/\\/g, '\\\\')}"`,
      __USER_API_PATH__: `"${path.join(projectPath, 'src/modules/userApi').replace(/\\/g, '\\\\')}"`,
      __GIT_COMMIT__: `"${gitInfo.commit_id}"`,
      __GIT_COMMIT_DATE__: `"${gitInfo.commit_date}"`,
      // __QRC_DECODE_NODE_PATH__: `"${(isProd ? '../../build/Release' : path.join(rootPath, 'build/Release')).replace(/\\/g, '\\\\')}"`,
    },
    // cacheDir: path.join(rootPath, 'node_modules/.vite/main'),
  }
}
