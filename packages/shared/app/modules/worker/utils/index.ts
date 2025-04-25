import path from 'node:path'
import { Worker } from 'node:worker_threads'

import { createMessage2Call, createProxyCallback } from 'message2call'

// import dbService from '../dbService/index'

export declare type DBSeriveTypes = WarpPromiseRecord<AnyListen.WorkerDBSeriveListTypes>
export declare type UtilSeriveTypes = WarpPromiseRecord<AnyListen.WorkerUtilSeriveTypes>
export declare type ExtensionSeriveTypes = WarpPromiseRecord<AnyListen.WorkerExtensionSeriveTypes>

export const createDBServiceWorker = (onInited: () => void): DBSeriveTypes => {
  const worker: Worker = new Worker(path.join(__dirname, './db-service.worker'))
  const subChannel = new MessageChannel()

  const msg2call = createMessage2Call<DBSeriveTypes>({
    exposeObj: {
      inited() {
        onInited()
      },
    },
    isSendErrorStack: true,
    timeout: 0,
    sendMessage(message) {
      subChannel.port2.postMessage(message)
    },
  })
  subChannel.port2.on('message', (message) => {
    msg2call.message(message)
  })
  worker.postMessage(subChannel.port1, [subChannel.port1])
  worker.on('exit', () => {
    msg2call.destroy()
  })
  return msg2call.remote
}

export const createUtilServiceWorker = (onInited: () => void): UtilSeriveTypes => {
  const worker: Worker = new Worker(path.join(__dirname, './util-service.worker'))
  const subChannel = new MessageChannel()

  const msg2call = createMessage2Call<UtilSeriveTypes>({
    exposeObj: {
      inited() {
        onInited()
      },
    },
    isSendErrorStack: true,
    timeout: 0,
    sendMessage(message) {
      subChannel.port2.postMessage(message)
    },
  })
  subChannel.port2.on('message', (message) => {
    msg2call.message(message)
  })
  worker.postMessage(subChannel.port1, [subChannel.port1])
  worker.on('exit', () => {
    msg2call.destroy()
  })
  return msg2call.remote
}

export const createExtensionServiceWorker = (
  onInited: () => void,
  exposedFuncs: AnyListen.IPCExtension.MainIPCActions
): {
  worker: Worker
  service: ExtensionSeriveTypes
} => {
  const worker: Worker = new Worker(path.join(__dirname, './extension-service.worker'))
  const subChannel = new MessageChannel()

  const msg2call = createMessage2Call<ExtensionSeriveTypes>({
    exposeObj: {
      inited() {
        onInited()
      },
      ...exposedFuncs,
    },
    isSendErrorStack: true,
    timeout: 0,
    sendMessage(message) {
      subChannel.port2.postMessage(message)
    },
  })
  subChannel.port2.on('message', (message) => {
    msg2call.message(message)
  })
  worker.postMessage(subChannel.port1, [subChannel.port1])
  worker.on('exit', () => {
    msg2call.destroy()
  })
  return {
    worker,
    service: msg2call.remote,
  } as const
}

export { createProxyCallback as proxyCallback }
