// interface ActionBase<A> {
//   // key: string
//   action: A
// }
// interface ActionData<A, D> extends ActionBase<A> {
//   data: D
// }
// type Action<A, D = undefined> = D extends undefined ? ActionBase<A> : ActionData<A, D>
