import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'

import { createCache } from '@any-listen/common/cache'
import { DEV_SERVER_PORTS } from '@any-listen/common/constants'
import { formatExtensionGHMirrorHosts } from '@any-listen/common/tools'

import { ENV_PARAMS } from '@/shared/constants'

import { printLogo } from './app/shared/utils'
import { destroySockets, onUpgrade } from './modules/ipc/websocket'
import { createServerApp } from './server'
import { initServerData } from './shared/data'
import defaultConfig from './shared/defaultConfig'
import { initLogger, startupLog } from './shared/log4js'
import { checkAndCreateDir, exit, nodeProcess } from './shared/utils'

printLogo()

type ENV_PARAMS_Type = typeof ENV_PARAMS
type ENV_PARAMS_Value_Type = ENV_PARAMS_Type[number]

let envParams: Partial<Record<ENV_PARAMS_Value_Type, string>> = {}
const envParamKeys = Object.values(ENV_PARAMS)

{
  const envLog = [
    ...(envParamKeys.map((e) => [e, nodeProcess.env[e]]) as Array<[ENV_PARAMS_Value_Type, string]>).filter(([k, v]) => {
      if (!v) return false
      envParams[k] = v
      return true
    }),
  ].map(([e, v]) => `${e}: ${v}`)
  if (envLog.length) console.log(`Load env: \n  ${envLog.join('\n  ')}`)
}

const dataPath = envParams.DATA_PATH ?? path.join(__dirname, '../data')
const logPath = envParams.LOG_PATH ?? path.join(dataPath, 'logs')
global.anylisten = {
  dataPath,
  config: defaultConfig,
  publicStaticPaths: createCache({
    max: 1000,
    ttl: 1000 * 60 * 60 * 24 * 2,
    updateAgeOnGet: true,
  }),
}

const mergeConfigFileEnv = (config: Partial<Record<ENV_PARAMS_Value_Type, string>>) => {
  const envLog = []
  for (const [k, v] of Object.entries(config).filter(([k]) => k.startsWith('env.'))) {
    const envKey = k.replace('env.', '') as keyof typeof envParams
    let value = String(v)
    if (envParamKeys.includes(envKey)) {
      if (envParams[envKey] == null) {
        envLog.push(`${envKey}: ${value}`)
        envParams[envKey] = value
      }
    }
  }
  if (envLog.length) console.log(`Load config file env:\n  ${envLog.join('\n  ')}`)
}

const margeConfig = (p: string) => {
  let config: Partial<AnyListen.Config>
  try {
    config = /\.c?js/.test(path.extname(p))
      ? // eslint-disable-next-line @typescript-eslint/no-require-imports
        (require(p) as AnyListen.Config)
      : (JSON.parse(fs.readFileSync(p).toString()) as AnyListen.Config)
  } catch (err) {
    console.warn(`Read config error: ${(err as Error).message}`)
    return false
  }
  const newConfig = { ...global.anylisten.config }
  for (const key of Object.keys(defaultConfig) as Array<keyof AnyListen.Config>) {
    // @ts-expect-error

    if (config[key] !== undefined) newConfig[key] = config[key]
  }

  console.log(`Load config: ${p}`)
  global.anylisten.config = newConfig

  mergeConfigFileEnv(config as Partial<Record<ENV_PARAMS_Value_Type, string>>)
  return true
}

const p1 = path.join(dataPath, './config.cjs')
fs.existsSync(p1) && margeConfig(p1)
envParams.CONFIG_PATH && fs.existsSync(envParams.CONFIG_PATH) && margeConfig(envParams.CONFIG_PATH)
if (envParams.PROXY_HEADER) {
  global.anylisten.config['upstreamProxy.enabled'] = true
  global.anylisten.config['upstreamProxy.header'] = envParams.PROXY_HEADER
}
if (global.anylisten.config['upstreamProxy.enabled']) {
  global.anylisten.config['upstreamProxy.header'] = global.anylisten.config['upstreamProxy.header'].toLowerCase()
}
if (envParams.LOGIN_PWD) global.anylisten.config.password = envParams.LOGIN_PWD
if (envParams.ALLOW_PUBLIC_DIR) {
  global.anylisten.config.allowPublicDir = envParams.ALLOW_PUBLIC_DIR.split(',')
}
global.anylisten.config.allowPublicDir = global.anylisten.config.allowPublicDir.map((p) => {
  let newP = p.replace(/\\|\//g, path.sep)
  if (!newP.endsWith(path.sep)) return newP + path.sep
  return newP
})
if (envParams.EXTENSION_GH_MIRROR_HOSTS) {
  global.anylisten.config['extension.ghMirrorHosts'] = envParams.EXTENSION_GH_MIRROR_HOSTS.split(',')
}
global.anylisten.config['extension.ghMirrorHosts'] = formatExtensionGHMirrorHosts(
  global.anylisten.config['extension.ghMirrorHosts']
)
if (envParams.HTTP_PROXY) {
  global.anylisten.config.httpProxy = envParams.HTTP_PROXY
}
global.anylisten.config.httpProxy = global.anylisten.config.httpProxy.replace(/https?:\/\//, '')

console.log(`Allowed Public Paths:
  ${global.anylisten.config.allowPublicDir.join('\n  ') || '  No Paths'}
`)
console.log(`Login Password: ${global.anylisten.config.password || 'No Password'}
`)

if (import.meta.env.DEV) {
  global.anylisten.config['cors.enabled'] = true
  global.anylisten.config['cors.whitelist'].push(`http://localhost:${DEV_SERVER_PORTS['view-main']}`)
}

checkAndCreateDir(logPath)
checkAndCreateDir(dataPath)

initLogger(logPath)

initServerData()

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val: string) {
  const port = parseInt(val, 10)

  if (isNaN(port) || port < 1) {
    // named pipe
    exit(`port illegal: ${val}`)
  }
  return port
}

/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(envParams.PORT ?? global.anylisten.config.port)
const bindIP = envParams.BIND_IP ?? global.anylisten.config.bindIp
startupLog.info(`starting web server in ${process.env.NODE_ENV == 'production' ? 'production' : 'development'}`)

const koaApp = createServerApp(global.anylisten.config)
const server = http.createServer(koaApp.callback())

/**
 * Event listener for HTTP server "error" event.
 */
server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.syscall !== 'listen') {
    throw error
  }

  const bind = `Port ${port}`

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      startupLog.error(`${bind} requires elevated privileges`)
      process.exit(1)
    // eslint-disable-next-line no-fallthrough
    case 'EADDRINUSE':
      startupLog.error(`${bind} is already in use`)
      process.exit(1)
    // eslint-disable-next-line no-fallthrough
    default:
      throw error
  }
})

/**
 * Event listener for HTTP server "listening" event.
 */
server.on('listening', async () => {
  const addr = server.address()
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr?.port}`
  startupLog.info(`Listening on ${bindIP} ${bind}`)

  if (import.meta.env.PROD) {
    await import('./envPrepare')
      .then(async ({ envPrepare }) => {
        await envPrepare()
      })
      .catch((err) => {
        console.log(err)
        process.exit()
      })
  }
  void import('./app').then(({ initApp }) => {
    void initApp()
  })
})

server.on('upgrade', onUpgrade)

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, bindIP)

process.on('SIGINT', () => {
  startupLog.info('Received SIGINT. Shutting down gracefully...')
  destroySockets()
  server.close(() => {
    startupLog.info('Server shut down successfully.')
    process.exit(0)
  })
  setTimeout(() => {
    startupLog.error('Server shutdown timed out. Forcing exit...')
    process.exit(1)
  }, 2000)
})
process.on('SIGTERM', () => {
  startupLog.info('Received SIGTERM. Shutting down gracefully...')
  destroySockets()
  server.close(() => {
    startupLog.info('Server shut down successfully.')
    process.exit(0)
  })
  setTimeout(() => {
    startupLog.error('Server shutdown timed out. Forcing exit...')
    process.exit(1)
  }, 2000)
})
