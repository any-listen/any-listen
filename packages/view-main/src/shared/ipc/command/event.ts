import ExecEvent, { type EventType } from '@any-listen/common/ExecEvent'

class MainEvent extends ExecEvent {
  async viewMainCommand(command: string, ...args: unknown[]) {
    return this.execute('viewMainCommand', command, ...args)
  }
}

export const remoteCommandEvent = new MainEvent() as EventType<MainEvent>
