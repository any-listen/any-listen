declare namespace AnyListen {
  namespace IPCDesktopLyric {
    type ServerActions = WarpPromiseRecord<{
      showDesktopLyric: () => void
      hideDesktopLyric: () => void
    }>
    type ServerIPCActions<Socket = undefined> = IPC.WarpIPCHandlerActions<Socket, ServerActions>

    // type ClientActions = WarpPromiseRecord<{
    //   dislikeAction: (action: IPCDislikeList.ActionList) => void
    // }>
    // type ClientIPCActions<Socket = undefined> = IPC.WarpIPCHandlerActions<Socket, ClientActions>
  }
}
