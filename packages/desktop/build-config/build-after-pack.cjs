const { afterPack, restoreBindingGyp } = require('./deps.cjs')

const fs = require('fs').promises

// 包含 macOS 常见语言代码的列表
const locales = [
  'af',
  'en',
  'hr',
  'mr',
  'sv',
  'am',
  'en_GB',
  'hu',
  'ms',
  'sw',
  'es',
  'nb',
  'ta',
  'es_419',
  'id',
  'nl',
  'te',
  'ar',
  'et',
  'it',
  'pl',
  'th',
  'bg',
  'fa',
  'ja',
  'pt_BR',
  'tr',
  'bn',
  'fi',
  'kn',
  'pt_PT',
  'uk',
  'ca',
  'fil',
  'ko',
  'ro',
  'ur',
  'cs',
  'fr',
  'ru',
  'vi',
  'da',
  'gu',
  'lt',
  'sk',
  'zh_CN',
  'de',
  'he',
  'lv',
  'sl',
  'zh_TW',
  'el',
  'hi',
  'ml',
  'sr',
]

const commonMacLanguagesInfoPlistStrings = {
  CFBundleDisplayName: 'Any Listen',
  CFBundleName: 'Any Listen',
}
// const macLanguagesInfoPlistStrings = {
//   en: {
//     CFBundleDisplayName: 'Any Listen',
//     CFBundleName: 'Any Listen',
//   },
//   zh_CN: {
//     CFBundleDisplayName: 'Any Listen',
//     CFBundleName: 'Any Listen',
//   },
//   zh_TW: {
//     CFBundleDisplayName: 'Any Listen',
//     CFBundleName: 'Any Listen',
//   },
// }
const macLanguagesInfoPlistStrings = locales.reduce((acc, locale) => {
  acc[locale] = { ...commonMacLanguagesInfoPlistStrings }
  return acc
}, {})

// https://github.com/electron-userland/electron-builder/issues/4630
// https://github.com/electron-userland/electron-builder/issues/4630#issuecomment-782020139

module.exports = async (context) => {
  await afterPack()
  await restoreBindingGyp()
  const { electronPlatformName, appOutDir, packager } = context
  if (electronPlatformName !== 'darwin') return

  const resPath = `${appOutDir}/${packager.appInfo.productFilename}.app/Contents/Resources`

  // 创建APP语言包文件
  return Promise.all(
    Object.entries(macLanguagesInfoPlistStrings).map(([lang, config]) => {
      let infos = Object.entries(config)
        .map(([k, v]) => `"${k}" = "${v}";`)
        .join('\n')
      return fs.writeFile(`${resPath}/${lang}.lproj/InfoPlist.strings`, infos)
    })
  )
}
