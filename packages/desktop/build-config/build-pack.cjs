const builder = require('electron-builder')
const beforePack = require('./build-before-pack.cjs')
const afterPack = require('./build-after-pack.cjs')
// const fs = require('node:fs')
const path = require('node:path')
const { rmSourceModule } = require('./native-module.cjs')

const rootPath = path.join(__dirname, '../../..')

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const options = {
  appId: 'cn.toside.anylisten.desktop',
  productName: 'any-listen',
  extraMetadata: {
    name: 'any-listen',
    main: 'dist/electron/main.js',
    description: 'A cross-platform private music playback service',
    author: {
      name: 'lyswhut',
      email: 'lyswhut@qq.com',
    },
  },
  beforePack,
  afterPack,
  protocols: {
    name: 'anylisten-protocol',
    schemes: ['anylisten'],
  },
  directories: {
    buildResources: './resources',
    output: path.join(rootPath, 'build'),
  },
  files: [
    '!node_modules/**/*',
    'node_modules/font-list',
    {
      // from: fs.realpathSync(path.join(__dirname, '../node_modules/better-sqlite3/build/Release')),
      from: 'node_modules/better-sqlite3/build/Release',
      to: 'dist/electron/native',
      filter: ['better_sqlite3.node'],
    },
    'dist/**/*',
  ],
  asar: {
    smartUnpack: false,
  },
  extraResources: ['./licenses'],
  publish: [
    {
      provider: 'github',
      owner: 'any-listen',
      repo: 'any-listen-desktop',
    },
  ],
}
/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const winOptions = {
  win: {
    icon: './resources/icons/icon.ico',
    legalTrademarks: 'lyswhut',
    // artifactName: '${productName}-${version}-${env.ARCH}-${env.TARGET}.${ext}',
  },
  nsis: {
    oneClick: false,
    language: '2052',
    allowToChangeInstallationDirectory: true,
    differentialPackage: true,
    license: './licenses/license.rtf',
    shortcutName: 'Any Listen',
  },
}
/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const linuxOptions = {
  linux: {
    maintainer: 'lyswhut <lyswhut@qq.com>',
    // artifactName: '${productName}-${version}.${env.ARCH}.${ext}',
    icon: './resources/icons',
    category: 'Utility;AudioVideo;Audio;Player;Music;',
    desktop: {
      // https://www.electron.build/app-builder-lib.interface.linuxdesktopfile
      // https://www.electronjs.org/docs/latest/tutorial/linux-desktop-actions
      // https://specifications.freedesktop.org/desktop-entry-spec/latest/example.html
      // https://developer.gnome.org/documentation/guidelines/maintainer/integrating.html#desktop-files
      entry: {
        Name: 'Any Listen',
        'Name[zh_CN]': 'Any Listen',
        'Name[zh_TW]': 'Any Listen',
        Encoding: 'UTF-8',
        MimeType: 'x-scheme-handler/anylisten',
        StartupNotify: 'false',
      },
      // Name: 'Any Listen',
      // 'Name[zh_CN]': 'Any Listen',
      // 'Name[zh_TW]': 'Any Listen',
      // Encoding: 'UTF-8',
      // MimeType: 'x-scheme-handler/anylisten',
      // StartupNotify: 'false',
    },
  },
  appImage: {
    license: './licenses/license_zh.txt',
    category: 'Utility;AudioVideo;Audio;Player;Music;',
  },
}
/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const macOptions = {
  mac: {
    icon: './resources/icons/icon.icns',
    category: 'public.app-category.music',
    // artifactName: '${productName}-${version}.${ext}',
  },
  dmg: {
    // window: {
    //   width: 540,
    //   height: 100,
    // },
    contents: [
      {
        x: 130,
        y: 190,
      },
      {
        x: 410,
        y: 190,
        type: 'link',
        path: '/Applications',
      },
    ],
    title: 'Any Listen v${version}',
  },
}

// win: {
// tagret: {
//   setup: ['nsis', '${productName}-${version}-${env.ARCH}-Setup.${ext}'],
//   green: ['7z', '${productName}-${version}-${env.ARCH}-green.${ext}'],
//   portable: ['portable', '${productName}-${version}-${env.ARCH}-portable.${ext}'],
// },
// },
// linux: {
// platform: Platform.WINDOWS,
// arch: {
//   x64: builder.Arch.x64,
//   arm64: builder.Arch.arm64,
//   armv7l: builder.Arch.armv7l,
// },
// tagret: {
//   deb: ['deb', '${productName}_${version}_${env.ARCH}.${ext}'],
//   appImage: ['AppImage', '${productName}_${version}_${env.ARCH}.${ext}'],
//   pacman: ['pacman', '${productName}_${version}_${env.ARCH}.${ext}'],
//   rpm: ['rpm', '${productName}-${version}.${env.ARCH}.${ext}'],
// },
// },
// mac: {
// arch: {
//   x64: builder.Arch.x64,
//   x86: builder.Arch.ia32,
//   arm64: builder.Arch.arm64,
// },
// tagret: {
//   dmg: ['dmg', '${productName}-${version}-${env.ARCH}.${ext}'],
// },
// },

const createTarget = {
  /**
   *
   * @param {*} packageType
   * @returns {{ buildOptions: import('electron-builder').CliOptions, options: import('electron-builder').Configuration }}
   */
  win(packageType) {
    switch (packageType) {
      case 'setup':
        winOptions.artifactName = `\${productName}-\${version}-\${arch}-Setup.\${ext}`
        return {
          buildOptions: { win: ['nsis'] },
          options: winOptions,
        }
      case 'green':
        winOptions.artifactName = `\${productName}-\${version}-win_\${arch}-green.\${ext}`
        return {
          buildOptions: { win: ['7z'] },
          options: winOptions,
        }
      case 'win7_setup':
        winOptions.artifactName = `\${productName}-v\${version}-win7_\${arch}-Setup.\${ext}`
        return {
          buildOptions: { win: ['nsis'] },
          options: winOptions,
        }
      case 'win7_green':
        winOptions.artifactName = `\${productName}-\${version}-win7_\${arch}-green.\${ext}`
        return {
          buildOptions: { win: ['7z'] },
          options: winOptions,
        }
      case 'portable':
        winOptions.artifactName = `\${productName}-\${version}-\${arch}-portable.\${ext}`
        return {
          buildOptions: { win: ['portable'] },
          options: winOptions,
        }
      default:
        throw new Error(`Unknown package type: ${packageType}`)
    }
  },
  /**
   *
   * @param {*} packageType
   * @returns {{ buildOptions: import('electron-builder').CliOptions, options: import('electron-builder').Configuration }}
   */
  linux(packageType) {
    switch (packageType) {
      case 'deb':
        linuxOptions.artifactName = `\${productName}_\${version}_\${arch}.\${ext}`
        return {
          buildOptions: { linux: ['deb'] },
          options: linuxOptions,
        }
      case 'appImage':
        linuxOptions.artifactName = `\${productName}_\${version}_\${arch}.\${ext}`
        return {
          buildOptions: { linux: ['AppImage'] },
          options: linuxOptions,
        }
      case 'pacman':
        linuxOptions.artifactName = `\${productName}_\${version}_\${arch}.\${ext}`
        return {
          buildOptions: { linux: ['pacman'] },
          options: linuxOptions,
        }
      case 'rpm':
        linuxOptions.artifactName = `\${productName}-\${version}.\${arch}.\${ext}`
        return {
          buildOptions: { linux: ['rpm'] },
          options: linuxOptions,
        }
      default:
        throw new Error(`Unknown package type: ${packageType}`)
    }
  },
  /**
   *
   * @param {*} packageType
   * @returns {{ buildOptions: import('electron-builder').CliOptions, options: import('electron-builder').Configuration }}
   */
  mac(packageType) {
    switch (packageType) {
      case 'dmg':
        macOptions.artifactName = `\${productName}-\${version}-\${arch}.\${ext}`
        return {
          buildOptions: { mac: ['dmg', 'zip'] },
          options: macOptions,
        }
      default:
        throw new Error(`Unknown package type: ${packageType}`)
    }
  },
}

/**
 *
 * @param {'win' | 'mac' | 'linux' | 'dir'} target 构建目标平台
 * @param {Array<'x86_64' | 'x64' | 'x86' | 'arm64' | 'armv7l'>} arch 包架构
 * @param {*} packageType 包类型
 * @param {'onTag' | 'onTagOrDraft' | 'always' | 'never'} publishType 发布类型
 */
const build = async (target, arch, packageType, publishType) => {
  if (target == 'dir') {
    await builder.build({
      dir: true,
      config: { ...options, ...winOptions, ...linuxOptions, ...macOptions },
    })
    return
  }
  const targetInfo = createTarget[target](packageType)
  // Promise is returned
  await builder.build({
    ...targetInfo.buildOptions,
    publish: publishType ?? 'never',
    x64: arch.includes('x64') || arch.includes('x86_64'),
    ia32: arch.includes('x86') || arch.includes('x86_64'),
    arm64: arch.includes('arm64'),
    armv7l: arch.includes('armv7l'),
    universal: arch.includes('universal'),
    config: { ...options, ...targetInfo.options },
  })
  // .then((result) => {
  //   console.log(JSON.stringify(result))
  // })
  // .catch((error) => {
  //   console.error(error)
  // })
}

const params = {}

for (const param of process.argv.slice(2)) {
  const [name, value] = param.split('=')
  params[name] = value
}

if (params.target == null) throw new Error('Missing target')
if (params.target != 'dir' && params.arch == null) throw new Error('Missing arch')
if (params.target != 'dir' && params.type == null) throw new Error('Missing type')

console.log(params.target, params.arch, params.type, params.publish ?? '')

rmSourceModule()
build(params.target, params.arch.split(','), params.type, params.publish)
