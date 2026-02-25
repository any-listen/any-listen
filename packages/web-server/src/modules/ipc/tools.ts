import { constants, createCipheriv, createDecipheriv, privateDecrypt, publicEncrypt } from 'node:crypto'
// import { join } from 'node:path'
// import zlib from 'node:zlib'
import type http from 'node:http'
import { networkInterfaces } from 'node:os'

// import { saveClientKeyInfo } from './data'
import { sign, verify } from 'jsonwebtoken'

// import getStore from '@/utils/store'
// import { appLog } from '@/shared/log4js'
// import { getUserName } from '../user/data'
import type { KeyInfo, Status } from './websocket'

export const getAddress = (): string[] => {
  const nets = networkInterfaces()
  const results: string[] = []
  // console.log(nets)

  for (const interfaceInfos of Object.values(nets)) {
    if (!interfaceInfos) continue
    // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
    for (const interfaceInfo of interfaceInfos) {
      if (interfaceInfo.family === 'IPv4' && !interfaceInfo.internal) {
        results.push(interfaceInfo.address)
      }
    }
  }
  return results
}

export const generateCode = (): string => {
  return Math.random().toString().substring(2, 8)
}

export const getIP = (request: http.IncomingMessage) => {
  let ip: string | undefined
  if (global.anylisten.config['upstreamProxy.enabled']) {
    const proxyIp = request.headers[global.anylisten.config['upstreamProxy.header']]
    if (typeof proxyIp == 'string') ip = proxyIp
  }
  ip ||= request.socket.remoteAddress

  return ip
}

export const aesEncrypt = (buffer: string | Buffer, key: string): string => {
  const cipher = createCipheriv('aes-128-ecb', Buffer.from(key, 'base64'), '')
  return Buffer.concat([cipher.update(buffer), cipher.final()]).toString('base64')
}

export const aesDecrypt = (text: string, key: string): string => {
  const decipher = createDecipheriv('aes-128-ecb', Buffer.from(key, 'base64'), '')
  return Buffer.concat([decipher.update(Buffer.from(text, 'base64')), decipher.final()]).toString()
}

export const rsaEncrypt = (buffer: Buffer, key: string): string => {
  return publicEncrypt({ key, padding: constants.RSA_PKCS1_OAEP_PADDING }, buffer).toString('base64')
}
export const rsaDecrypt = (buffer: Buffer, key: string): Buffer => {
  return privateDecrypt({ key, padding: constants.RSA_PKCS1_OAEP_PADDING }, buffer)
}

// const gzip = async (data: string) =>
//   new Promise<string>((resolve, reject) => {
//     zlib.gzip(data, (err, buf) => {
//       if (err) {
//         reject(err)
//         return
//       }
//       resolve(buf.toString('base64'))
//     })
//   })
// const unGzip = async (data: string) =>
//   new Promise<string>((resolve, reject) => {
//     zlib.gunzip(Buffer.from(data, 'base64'), (err, buf) => {
//       if (err) {
//         reject(err)
//         return
//       }
//       resolve(buf.toString())
//     })
//   })

export const encryptMsg = async (keyInfo: KeyInfo, msg: string): Promise<string> => {
  // return msg.length > 1024
  //   ? 'cg_' + await gzipString(msg)
  //   : msg
  // if (!keyInfo) return ''
  // return aesEncrypt(msg, keyInfo.key, keyInfo.iv)
  return msg
}

export const decryptMsg = async (keyInfo: KeyInfo, enMsg: string): Promise<string> => {
  // return enMsg.substring(0, 3) == 'cg_'
  //   ? unGzipString(enMsg.replace('cg_', ''))
  //   : enMsg
  // if (!keyInfo) return ''
  // let msg = ''
  // try {
  //   msg = aesDecrypt(enMsg, keyInfo.key, keyInfo.iv)
  // } catch (err) {
  //   console.log(err)
  // }
  return enMsg
}

// export const encryptMsg = async(keyInfo: KeyInfo | null, msg: string): Promise<string> => {
//   return msg.length > 1024
//     ? 'cg_' + await gzip(msg)
//     : msg
//   // if (!keyInfo) return ''
//   // return aesEncrypt(msg, keyInfo.key, keyInfo.iv)
// }

// export const decryptMsg = async(keyInfo: KeyInfo | null, enMsg: string): Promise<string> => {
//   return enMsg.substring(0, 3) == 'cg_'
//     ? await unGzip(enMsg.replace('cg_', ''))
//     : enMsg
//   // console.log('decmsg raw: ', len.length, 'en: ', enMsg.length)

//   // if (!keyInfo) return ''
//   // let msg = ''
//   // try {
//   //   msg = aesDecrypt(enMsg, keyInfo.key, keyInfo.iv)
//   // } catch (err) {
//   //   console.log(err)
//   // }
//   // return msg
// }

// export const getSnapshotFilePath = (keyInfo: KeyInfo): string => {
//   return join(global.anylisten.snapshotPath, `snapshot_${keyInfo.snapshotKey}.json`)
// }

export const sendStatus = (status: Status) => {
  // TODO
  // appLog.info('status', status.devices.map(d => `${getUserName(d.clientId) ?? ''} ${d.deviceName}`))
}

export const createToken = async (keyInfo: KeyInfo, key: string) =>
  new Promise<string>((resolve, reject) => {
    sign(
      keyInfo,
      key,
      {
        // expiresIn: Date.now() + 86400 * 90,
      },
      (err, result) => {
        if (err) reject(err)
        else resolve(result!)
      }
    )
  })
export const verifyToken = async (token: string, key: string) =>
  new Promise<KeyInfo | null>((resolve, reject) => {
    verify(token, key, (err, decoded) => {
      if (err) reject(err)
      else resolve(decoded as KeyInfo | null)
    })
  })
