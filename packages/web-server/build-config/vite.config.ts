import { execSync, spawn } from 'node:child_process'
import { builtinModules } from 'node:module'
import path from 'node:path'

import type { UserConfig } from 'vite'

export { buildConfig as buildPreloadConfig } from './vite.config.web'

const isProd = process.env.NODE_ENV == 'production'
const rootPath = path.join(__dirname, '../../../')
const projectPath = path.join(rootPath, 'packages/web-server')

export const runServer = (onLog: (data: Buffer, color: 'red' | 'blue') => void) => {
  let args = [path.join(projectPath, 'index.cjs')]

  // detect yarn or npm and process commandline args accordingly
  if (process.env.npm_execpath?.endsWith('yarn.js')) {
    args = args.concat(process.argv.slice(3))
  } else if (process.env.npm_execpath?.endsWith('npm-cli.js')) {
    args = args.concat(process.argv.slice(2))
  } else if (process.env.npm_execpath?.endsWith('pnpm.cjs')) {
    args = args.concat(process.argv.slice(2))
  }

  const webProcess = spawn('node', args, {
    cwd: projectPath,
    env: {
      NODE_OPTIONS: '--enable-source-maps',
      // reference https://maxschmitt.me/posts/error-spawn-node-enoent-node-js-child-process
      PATH: process.env.PATH,
    },
  })

  webProcess.stdout.on('data', (data: Buffer) => {
    onLog(data, 'blue')
  })
  webProcess.stderr.on('data', (data: Buffer) => {
    onLog(data, 'red')
  })

  webProcess.on('close', () => {
    process.exit()
  })

  return webProcess
}

export const buildConfig = (mode: string): UserConfig => {
  const gitInfo = {
    commit_id: '',
    commit_date: '',
  }
  try {
    if (!execSync('git status --porcelain').toString().trim()) {
      gitInfo.commit_id = execSync('git log -1 --pretty=format:"%H"').toString().trim()
      gitInfo.commit_date = execSync('git log -1 --pretty=format:"%ad" --date=iso-strict').toString().trim()
    } else if (process.env.IS_CI) {
      console.error('Working directory is not clean')
      process.exit(1)
    }
  } catch (err) {
    if (process.env.IS_CI) {
      const commitId = process.env.GIT_COMMIT_ID
      const commitDate = process.env.GIT_COMMIT_DATE
      if (!commitId || !commitDate) {
        throw new Error('GIT_COMMIT_ID and GIT_COMMIT_DATE environment variables are required in CI', { cause: err })
      }
      gitInfo.commit_id = commitId
      gitInfo.commit_date = commitDate
    }
  }

  return {
    mode,
    root: projectPath,
    base: './',
    publicDir: false,
    logLevel: 'warn',
    resolve: {
      alias: {
        '@': path.join(projectPath, 'src'),
        'node:sqlite': path.join(projectPath, 'build-config/sqlite.js'),
      },
      conditions: ['module', 'node', 'default', 'development|production'],
      mainFields: ['module', 'jsnext:main', 'jsnext'],
    },
    build: {
      target: 'node16',
      // lib: {
      //   entry: 'src/index.ts',
      //   formats: ['cjs'],
      //   fileName: 'main',
      // },
      outDir: isProd ? path.join(rootPath, 'build/server') : path.join(projectPath, 'server'),
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
      rolldownOptions: {
        external: [
          // /node_modules/,
          // 'better-sqlite3',
          ...builtinModules.flatMap((m) => [m, `node:${m}`]).filter((m) => m != 'node:sqlite'),
        ],
        input: {
          index: path.join(projectPath, 'src/index.ts'),
          'db-service.worker': path.join(rootPath, 'packages/shared/app/modules/worker/dbService/index.ts'),
          'util-service.worker': path.join(rootPath, 'packages/shared/app/modules/worker/utilService/index.ts'),
          'extension-service.worker': path.join(rootPath, 'packages/shared/app/modules/worker/extensionService/index.ts'),
        },
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          format: 'cjs',
          // manualChunks(id, info) {
          // //   return 'main'
          // },
          // experimentalMinChunkSize: 50_000,
        },
        logLevel: 'warn',
      },
    },
    define: {
      'process.env.NODE_ENV': `"${process.env.NODE_ENV!}"`,
      'process.env.WS_NO_BUFFER_UTIL': 'true',
      'process.env.WS_NO_UTF_8_VALIDATE': 'true',
      __GIT_COMMIT__: `"${gitInfo.commit_id}"`,
      __GIT_COMMIT_DATE__: `"${gitInfo.commit_date}"`,
      // __QRC_DECODE_NODE_PATH__: `"${(isProd ? '../../build/Release' : path.join(rootPath, 'build/Release')).replace(/\\/g, '\\\\')}"`,
    },
    // cacheDir: path.join(rootPath, 'node_modules/.vite/main'),
  }
}
