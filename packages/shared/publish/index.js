import chalk from 'chalk'
import { updateVersionFile } from './utils/updateChangeLog.js'

const run = async () => {
  const [type, version] = process.argv.slice(2)
  // @ts-ignore
  await updateVersionFile(type, version)
  console.log(chalk.green('日志更新完成~'))
}

run()
