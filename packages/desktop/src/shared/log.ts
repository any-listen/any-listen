import log from 'electron-log/main'

log.transports.file.level = 'info'

export { log }

export const logger: AnyListen.Logger = {
  debug(message, ...args) {
    log.debug(message, ...args)
  },
  info(message, ...args) {
    log.info(message, ...args)
  },
  warn(message, ...args) {
    log.warn(message, ...args)
  },
  error(message, ...args) {
    log.error(message, ...args)
  },
}
