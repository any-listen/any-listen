const fsPromises = require('fs').promises
const path = require('path')
const { Arch } = require('electron-builder')
const { beforePack, backupBindingGyp, restoreBindingGyp } = require('./deps.cjs')

// const better_sqlite3_fileNameMap = {
//   [Arch.x64]: 'linux-x64',
//   [Arch.arm64]: 'linux-arm64',
//   [Arch.armv7l]: 'linux-arm',
// }

const libFileNameMap = {
  win32: {
    [Arch.x64]: 'win32-x64',
    [Arch.ia32]: 'win32-ia32',
    [Arch.arm64]: 'win32-arm64',
  },
  linux: {
    [Arch.x64]: 'linux-x64',
    [Arch.arm64]: 'linux-arm64',
    [Arch.armv7l]: 'linux-arm',
  },
  darwin: {
    [Arch.x64]: 'darwin-x64',
    [Arch.arm64]: 'darwin-arm64',
  },
}

const replaceSqliteLib = async (platform, arch) => {
  // console.log(await fs.readdir(path.join(context.appOutDir, './resources/')))
  // if (context.electronPlatformName != 'linux' || context.arch != Arch.arm64) return
  // https://github.com/lyswhut/lx-music-desktop/issues/1102
  // https://github.com/lyswhut/lx-music-desktop/issues/1161
  console.log('replace sqlite lib...')
  const filePath = path.join(__dirname, `./lib/better_sqlite3_${libFileNameMap[platform][arch]}.node`)
  console.log(filePath)
  const targetPath = path.join(__dirname, '../node_modules/better-sqlite3/build/Release/better_sqlite3.node')
  await fsPromises.mkdir(path.dirname(targetPath), { recursive: true }).catch((_) => _)
  await fsPromises.copyFile(filePath, targetPath)
}

module.exports = async (context) => {
  // require('./rm-native-module.cjs')
  await beforePack()
  const { electronPlatformName, arch } = context
  // await replaceQrcDecodeLib(electronNodeAbi, electronPlatformName, arch)
  // if (electronPlatformName !== 'linux' || process.env.FORCE) return
  const electronVersion =
    context.packager?.info?._framework?.version ??
    require('../package.json').devDependencies.electron.replace(/^[^\d]*?(\d+)/, '$1')
  if (
    (electronPlatformName !== 'linux' && electronPlatformName !== 'win32') ||
    (electronPlatformName === 'win32' && parseInt(electronVersion) > 22) ||
    process.env.FORCE
  ) {
    return
  }
  switch (arch) {
    case Arch.x64:
    case Arch.ia32:
    case Arch.arm64:
    case Arch.armv7l:
      await backupBindingGyp()
      await replaceSqliteLib(electronPlatformName, arch)
      break

    default:
      await restoreBindingGyp()
      break
  }
}
