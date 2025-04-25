import type { TarOptionsWithAliasesAsyncNoFile } from 'tar'

export const unpack = async (filePath: string, dist: string, opts: TarOptionsWithAliasesAsyncNoFile = {}) => {
  const { x } = await import('tar')
  return x({
    file: filePath,
    C: dist,
    ...opts,
  })
}
