export const decodeString = async (buf: Buffer) => {
  const { detect } = await import('jschardet')
  const { confidence, encoding } = detect(buf)
  console.log('string encoding', confidence, encoding)
  if (confidence > 0.8) {
    const iconv = (await import('iconv-lite')).default
    if (iconv.encodingExists(encoding)) {
      const str = iconv.decode(buf, encoding)
      if (str) return str
    }
  }
  return null
}
