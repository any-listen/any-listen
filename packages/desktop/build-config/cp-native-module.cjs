const fs = require('node:fs')
const path = require('node:path')

const rootPath = path.join(__dirname, '../')
const distLib = path.join(rootPath, 'build-config/tempLib/better_sqlite3.node')
const sourceLib = path.join(rootPath, 'node_modules/better-sqlite3/build/Release/better_sqlite3.node')

fs.cpSync(sourceLib, distLib, { recursive: true })
// void fs.rmSync(sourceLib, { recursive: true })
