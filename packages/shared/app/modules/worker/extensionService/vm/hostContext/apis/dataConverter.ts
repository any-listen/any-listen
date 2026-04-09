const availableFromFormats: AnyListen.ExtensionVM.ConverterFormatFrom[] = ['base64', 'hex', 'utf-8']
const availableToFormats: AnyListen.ExtensionVM.ConverterFormatTo[] = ['binary', 'base64', 'hex', 'utf-8']
const availableBinaryToFormats: AnyListen.ExtensionVM.ConverterBinaryFormatTo[] = ['base64', 'hex', 'utf-8']

export const createDataConverter = (extension: AnyListen.Extension.Extension) => {
  return {
    dataConverterBinary: async <R extends AnyListen.ExtensionVM.ConverterBinaryFormatTo>(input: Uint8Array, toEncoding: R) => {
      if (!availableBinaryToFormats.includes(toEncoding)) {
        throw new Error(`Unsupported output format: ${toEncoding}`)
      }
      return Buffer.from(new Uint8Array(input)).toString(toEncoding) as R
    },
    dataConverterString: async <R extends AnyListen.ExtensionVM.ConverterFormatTo>(
      input: string,
      fromEncoding: AnyListen.ExtensionVM.ConverterFormatFrom,
      toEncoding: R
    ) => {
      if (!availableFromFormats.includes(fromEncoding)) {
        throw new Error(`Unsupported input format: ${fromEncoding}`)
      }
      if (!availableToFormats.includes(toEncoding)) {
        throw new Error(`Unsupported output format: ${toEncoding}`)
      }
      if (toEncoding === 'binary') {
        return new Uint8Array(Buffer.from(input, fromEncoding)) as unknown as R
      }
      return Buffer.from(input, fromEncoding).toString(toEncoding) as R
    },
  } as const
}
