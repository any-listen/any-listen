import { execFileSync } from 'node:child_process'
import { parseArgs, styleText } from 'node:util'

import { updateVersionFile } from './utils/updateChangeLog.ts'

type PublishType = 'web-server' | 'desktop'

// 未指定 type 时同时处理这两个包
const ALL_TYPES: readonly PublishType[] = ['desktop', 'web-server']

const run = async () => {
  const { values } = parseArgs({
    options: {
      type: { type: 'string' },
      update: { type: 'boolean', default: false },
      commit: { type: 'boolean', default: false },
    },
  })

  if (values.type != null && values.type !== 'web-server' && values.type !== 'desktop') {
    throw new Error('type 必须是 web-server 或 desktop')
  }
  const types: readonly PublishType[] = values.type ? [values.type] : ALL_TYPES

  const released: Array<{ type: PublishType; version: string }> = []
  for (const type of types) {
    const version = await updateVersionFile(type, values.update)
    released.push({ type, version })
  }
  console.log(styleText('green', '日志更新完成~'))

  if (values.commit) {
    const message = `chore: release ${released.map((r) => `${r.version} for ${r.type}`).join(' and ')}`
    execFileSync('git', ['add', '-A'], { stdio: 'inherit' })
    execFileSync('git', ['commit', '-m', message], { stdio: 'inherit' })
    console.log(styleText('green', `已提交: ${message}`))
  }
}

void run().catch((err: Error) => {
  console.error(styleText('red', err.message))
  process.exit(1)
})
