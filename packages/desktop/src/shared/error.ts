import { log } from './log'

const ignoreErrorMessage = ['Possible side-effect in debug-evaluate', 'Unexpected end of input']

process.on('uncaughtException', (error) => {
  if (import.meta.env.DEV) {
    if (ignoreErrorMessage.includes(error.message)) return
    console.error('An uncaught error occurred!')
  }
  void errorHandler.handleError(error)
})
process.on('unhandledRejection', (reason, p) => {
  if (import.meta.env.DEV) console.error('Unhandled Rejection at: Promise ', p)
  throw reason instanceof Error ? reason : new Error(String(reason))
})

export class AppError extends Error {
  public readonly isOperational: boolean

  constructor(description: string, isOperational: boolean) {
    super(description)
    Object.setPrototypeOf(this, new.target.prototype) // restore prototype chain
    this.isOperational = isOperational
    Error.captureStackTrace(this)
  }
}

export const errorHandler = {
  async handleError(err: Error) {
    log.error(err)
    // await sendMailToAdminIfCritical()
    // await saveInOpsQueueIfCritical()
    // await determineIfOperationalError()
  },

  isTrustedError(error: Error) {
    if (error instanceof AppError) {
      return error.isOperational
    }
    return false
  },
}
