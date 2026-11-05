/**
 * Make sure the better-sqlite3 native binding exists where the bundled main
 * process expects it (`build/Release/better_sqlite3.node`).
 *
 * The bundler inlines the fallback path of better-sqlite3's own binding lookup,
 * which only looks at `build/Release`; depending on how the dependency was
 * installed only `prebuilds/<platform>.node` exists. Copying it over keeps the
 * packaged app working in CI without touching any published artifact.
 */
const fs = require('node:fs')
const path = require('node:path')

const run = () => {
  let pkgDir
  try {
    pkgDir = path.dirname(require.resolve('better-sqlite3/package.json'))
  } catch {
    console.log('[ensure-sqlite-binding] better-sqlite3 is not installed, skipping')
    return
  }

  const target = path.join(pkgDir, 'build', 'Release', 'better_sqlite3.node')
  if (fs.existsSync(target)) {
    console.log(`[ensure-sqlite-binding] binding already present: ${target}`)
    return
  }

  const prebuildsDir = path.join(pkgDir, 'prebuilds')
  if (!fs.existsSync(prebuildsDir)) {
    console.log('[ensure-sqlite-binding] no prebuilds directory, leaving the package untouched')
    return
  }

  const prebuild = fs
    .readdirSync(prebuildsDir)
    .filter((name) => name.endsWith('.node'))
    .find((name) => {
      // prefer the prebuild matching the current platform/arch
      return name.startsWith(`${process.platform}-${process.arch}`)
    })

  if (!prebuild) {
    console.log('[ensure-sqlite-binding] no matching prebuild, leaving the package untouched')
    return
  }

  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.copyFileSync(path.join(prebuildsDir, prebuild), target)
  console.log(`[ensure-sqlite-binding] copied ${prebuild} -> build/Release/better_sqlite3.node`)
}

run()
