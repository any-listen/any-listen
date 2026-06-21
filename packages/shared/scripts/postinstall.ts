import { execSync } from 'node:child_process'

if (process.env.SKIP_LIB_COPY) {
  try {
    if (process.env.DESKTOP_ONLY) {
      execSync('pnpm -F desktop install:deps', { stdio: 'inherit' })
    }
  } catch (error) {
    console.error('Postinstall failed:', error)
    process.exit(1)
  }
  process.exit(0)
}

try {
  if (process.env.DESKTOP_ONLY) {
    execSync('pnpm -F desktop rebuild:deps', { stdio: 'inherit' })
  } else if (process.env.WEB_SERVER_ONLY) {
    execSync('pnpm -F web-server rebuild', { stdio: 'inherit' })
  } else {
    execSync('pnpm -F desktop rebuild:deps', { stdio: 'inherit' })
    execSync('pnpm -F web-server rebuild', { stdio: 'inherit' })
  }
} catch (error) {
  console.error('Postinstall failed:', error)
  process.exit(1)
}
