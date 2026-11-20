import {
  constants,
  createCipheriv,
  createDecipheriv,
  createHash,
  generateKeyPair as generateKeyPairCb,
  privateDecrypt,
  publicEncrypt,
} from 'node:crypto'
import { gunzip as gunzipCb, gzip as gzipCb } from 'node:zlib'

export const toMD5 = (data: string): string => createHash('md5').update(data).digest('hex')

/**
 * LX sync server uses AES-128-ECB without an IV, the key is the base64 decoded
 * form of the passed string and the result is base64 encoded.
 */
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

const gzip = async (data: string): Promise<string> =>
  new Promise((resolve, reject) => {
    gzipCb(data, (err, buf) => {
      if (err) reject(err)
      else resolve(buf.toString('base64'))
    })
  })

const unGzip = async (data: string): Promise<string> =>
  new Promise((resolve, reject) => {
    gunzipCb(Buffer.from(data, 'base64'), (err, buf) => {
      if (err) reject(err)
      else resolve(buf.toString())
    })
  })

/** Messages larger than this size are gzip compressed and prefixed with `cg_` */
export const COMPRESS_THRESHOLD = 1024
const COMPRESS_PREFIX = 'cg_'

export const encryptMsg = async (msg: string): Promise<string> => {
  return msg.length > COMPRESS_THRESHOLD ? COMPRESS_PREFIX + (await gzip(msg)) : msg
}

export const decryptMsg = async (msg: string): Promise<string> => {
  return msg.startsWith(COMPRESS_PREFIX) ? unGzip(msg.slice(COMPRESS_PREFIX.length)) : msg
}

export interface RsaKeyPair {
  publicKey: string
  privateKey: string
}

export const generateRsaKey = async (): Promise<RsaKeyPair> =>
  new Promise((resolve, reject) => {
    generateKeyPairCb(
      'rsa',
      {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      },
      (err, publicKey, privateKey) => {
        if (err) reject(err)
        else resolve({ publicKey, privateKey })
      }
    )
  })

/** Strip PEM header/footer and newlines, the sync server expects a single line key body */
export const cleanPublicKey = (publicKey: string): string =>
  publicKey.replaceAll('\n', '').replace('-----BEGIN PUBLIC KEY-----', '').replace('-----END PUBLIC KEY-----', '')

/**
 * The first connection derives the aes key from the connection code:
 * `base64(md5(authCode).substring(0, 16))`
 */
export const buildKeyFromAuthCode = (authCode: string): string => {
  return Buffer.from(toMD5(authCode).substring(0, 16)).toString('base64')
}
