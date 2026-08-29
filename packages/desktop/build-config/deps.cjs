const fs = require('fs')
const path = require('path')
const bindingFilePath = path.join(__dirname, '../node_modules/better-sqlite3/binding.gyp')
const bindingBakFilePath = path.join(__dirname, '../node_modules/better-sqlite3/binding.gyp.bak')
// const bindingBakFilePath = path.join(__dirname, '../node_modules/better-sqlite3/binding.gyp.bak')
exports.beforePack = async () => {
  if (!fs.existsSync(bindingFilePath)) return
  // fs.renameSync(bindingFilePath, bindingBakFilePath)
  try {
    fs.writeFileSync(
      bindingFilePath,
      fs.readFileSync(bindingFilePath, 'utf-8').replace(`'force_build%': 0,`, `'force_build%': 1,`)
    )
  } catch (error) {
    console.error(error)
  }
}
exports.afterPack = async () => {
  if (!fs.existsSync(bindingFilePath)) return
  // fs.renameSync(bindingBakFilePath, bindingFilePath)
  try {
    fs.writeFileSync(
      bindingFilePath,
      fs.readFileSync(bindingFilePath, 'utf-8').replace(`'force_build%': 1,`, `'force_build%': 0,`)
    )
  } catch (error) {
    console.error(error)
  }
}

exports.backupBindingGyp = async () => {
  if (!fs.existsSync(bindingFilePath)) return
  // console.log('rename binding file...')
  await fs.renameSync(bindingFilePath, bindingBakFilePath)
}

exports.restoreBindingGyp = async () => {
  if (!fs.existsSync(bindingBakFilePath)) return
  // console.log('rename binding file...')
  await fs.renameSync(bindingBakFilePath, bindingFilePath)
}
