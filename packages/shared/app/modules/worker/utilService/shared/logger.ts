let loggerInstance: AnyListen.Logger = console
export const setLogger = (log: AnyListen.Logger) => {
  loggerInstance = log
}
export const logger: AnyListen.Logger = {
  debug(message, ...args) {
    loggerInstance.debug(message, ...args)
  },
  info(message, ...args) {
    loggerInstance.info(message, ...args)
  },
  warn(message, ...args) {
    loggerInstance.warn(message, ...args)
  },
  error(message, ...args) {
    loggerInstance.error(message, ...args)
  },
}
