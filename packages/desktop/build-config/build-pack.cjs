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
  artifactName: `\${productName}-\${version}-\${arch}.\${ext}`,
  nsis: {
    oneClick: false,
    language: '2052',
    allowToChangeInstallationDirectory: true,
    differentialPackage: true,
    license: './licenses/license.rtf',
    shortcutName: 'Any Listen',
    artifactName: `\${productName}-\${version}-\${arch}-Setup.\${ext}`,
  },
  portable: {
    artifactName: `\${productName}-\${version}-\${arch}-portable.\${ext}`,
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
  artifactName: `\${productName}_\${version}_\${arch}.\${ext}`,
  appImage: {
    license: './licenses/license_zh.txt',
    category: 'Utility;AudioVideo;Audio;Player;Music;',
  },
  rpm: {
    artifactName: `\${productName}-\${version}.\${arch}.\${ext}`,
  },
}
/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const macOptions = {
  artifactName: `\${productName}-\${version}-\${arch}.\${ext}`,
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
   * @param {*} packageTypes
   * @returns {{ buildOptions: import('electron-builder').CliOptions, options: import('electron-builder').Configuration }}
   */
  win(packageTypes) {
    /**
     * @type {import('electron-builder').CliOptions['win']}
     */
    const buildOptions = []

    for (const packageType of packageTypes) {
      switch (packageType) {
        case 'setup':
          buildOptions.push('nsis')
          break
        case 'green':
          buildOptions.push('7z')
          winOptions.artifactName = `\${productName}-\${version}-win_\${arch}-green.\${ext}`
          break
        case 'portable':
          buildOptions.push('portable')
          break
        case 'win7_setup':
          buildOptions.push('nsis')
          winOptions.nsis.artifactName = `\${productName}-\${version}-win7_\${arch}-Setup.\${ext}`
          break
        case 'win7_green':
          buildOptions.push('7z')
          winOptions.artifactName = `\${productName}-\${version}-win7_\${arch}-green.\${ext}`
          break
        default:
          throw new Error(`Unknown package type: ${packageType}`)
      }
    }

    return {
      buildOptions: { win: buildOptions },
      options: winOptions,
    }
  },
  /**
   *
   * @param {*} packageTypes
   * @returns {{ buildOptions: import('electron-builder').CliOptions, options: import('electron-builder').Configuration }}
   */
  linux(packageTypes) {
    /**
     * @type {import('electron-builder').CliOptions['linux']}
     */
    const buildOptions = []

    for (const packageType of packageTypes) {
      switch (packageType) {
        case 'deb':
          buildOptions.push('deb')
          break
        case 'appImage':
          buildOptions.push('AppImage')
          break
        case 'pacman':
          buildOptions.push('pacman')
          break
        case 'rpm':
          buildOptions.push('rpm')
          break
        default:
          throw new Error(`Unknown package type: ${packageType}`)
      }
    }

    return {
      buildOptions: { linux: buildOptions },
      options: linuxOptions,
    }
  },
  /**
   *
   * @param {*} packageTypes
   * @returns {{ buildOptions: import('electron-builder').CliOptions, options: import('electron-builder').Configuration }}
   */
  mac(packageTypes) {
    /**
     * @type {import('electron-builder').CliOptions['mac']}
     */
    const buildOptions = []
    for (const packageType of packageTypes) {
      switch (packageType) {
        case 'dmg':
          buildOptions.push('dmg', 'zip')
          break
        default:
          throw new Error(`Unknown package type: ${packageType}`)
      }
    }

    return {
      buildOptions: { mac: buildOptions },
      options: macOptions,
    }
  },
}

/**
 *
 * @param {'win' | 'mac' | 'linux' | 'dir'} target 构建目标平台
 * @param {Array<'x86_64' | 'x64' | 'x86' | 'arm64' | 'armv7l'>} arch 包架构
 * @param {Array<string>} packageTypes 包类型
 * @param {'onTag' | 'onTagOrDraft' | 'always' | 'never'} publishType 发布类型
 */
const build = async (target, arch, packageTypes, publishType) => {
  if (target == 'dir') {
    await builder.build({
      dir: true,
      config: { ...options, ...winOptions, ...linuxOptions, ...macOptions },
    })
    return
  }
  const targetInfo = createTarget[target](packageTypes)
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
build(params.target, params.arch.split(','), params.type.split(','), params.publish)
