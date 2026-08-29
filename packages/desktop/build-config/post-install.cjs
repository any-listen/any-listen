// const { Arch } = require('electron-builder')
// require('./build-before-pack')({ electronPlatformName: process.platform, arch: Arch[process.arch] })

// require('./native-module.cjs').cpModule()
require('./deps.cjs').restoreBindingGyp()
require('./dependencies-patch.cjs')
