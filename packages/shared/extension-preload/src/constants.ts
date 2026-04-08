export const KEY_PREFIX = {
  publicKeyStart: '-----BEGIN PUBLIC KEY-----',
  publicKeyEnd: '-----END PUBLIC KEY-----',
  privateKeyStart: '-----BEGIN PRIVATE KEY-----',
  privateKeyEnd: '-----END PRIVATE KEY-----',
} as const

export const RSA_PADDING = {
  OAEPWithSHA1AndMGF1Padding: 'RSA/ECB/OAEPWithSHA1AndMGF1Padding',
  NoPadding: 'RSA/ECB/NoPadding',
} as const

export const AES_MODE = {
  CBC_128_PKCS7Padding: 'AES/CBC/PKCS7Padding',
  ECB_128_NoPadding: 'AES',
} as const

export const MAX_NATIVE_CALL_DATA_SIZE = 10 * 1024 * 1024
