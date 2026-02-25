// https://stackoverflow.com/a/69322301
// Returns R if T is a function, otherwise returns Fallback
type IsFunction<T, R, Fallback = T> = T extends (...args: any[]) => any ? R : Fallback

// Returns R if T is an object, otherwise returns Fallback
type IsObject<T, R, Fallback = T> = IsFunction<T, Fallback, T extends object ? R : Fallback>

// "a.b.c" => "b.c"
type Tail<S> = S extends `${string}.${infer T}` ? Tail<T> : S

// typeof Object.values(T)
type Value<T> = T[keyof T]

// {a: {b: 1, c: 2}} => {"a.b": {b: 1, c: 2}, "a.c": {b: 1, c: 2}}
type FlattenStepOne<T> = {
  [K in keyof T as K extends string ? IsObject<T[K], `${K}.${keyof T[K] & string}`, K> : K]: IsObject<
    T[K],
    { [key in keyof T[K]]: T[K][key] }
  >
}

// {"a.b": {b: 1, c: 2}, "a.c": {b: 1, c: 2}} => {"a.b": {b: 1}, "a.c": {c: 2}}
type FlattenStepTwo<T> = {
  [a in keyof T]: IsObject<T[a], Value<{ [M in keyof T[a] as M extends Tail<a> ? M : never]: T[a][M] }>>
}

// {a: {b: 1, c: {d: 1}}} => {"a.b": 1, "a.c": {d: 1}}
type FlattenOneLevel<T> = FlattenStepTwo<FlattenStepOne<T>>

// {a: {b: 1, c: {d: 1}}} => {"a.b": 1, "a.b.c.d": 1}
type Flatten<T> = T extends FlattenOneLevel<T> ? T : Flatten<FlattenOneLevel<T>>

declare global {
  type MakeOptional<Type, Key extends keyof Type> = Omit<Type, Key> & Partial<Pick<Type, Key>>
  type MakeRequired<Type, Key extends keyof Type> = Pick<Type, Key> & Partial<Omit<Type, Key>>

  type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
  }

  type Modify<T, R> = Omit<T, keyof R> & R

  // type UndefinedOrNever = undefined
  type Actions<T extends { action: string; data?: any }> = {
    [U in T as U['action']]: 'data' extends keyof U ? U['data'] : undefined
  }

  type WarpPromiseValue<T> = T extends (...args: any[]) => Promise<any>
    ? T
    : T extends (...args: infer P) => infer R
      ? (...args: P) => Promise<R>
      : Promise<T>

  type WarpPromiseRecord<T extends Record<string, any>> = {
    [K in keyof T]: WarpPromiseValue<T[K]>
  }

  type EntriesObject<T> = Array<
    {
      [K in keyof T]-?: [K, T[K]]
    }[keyof T]
  >

  type FlattenObject<T> = Flatten<T>
}

export {}
