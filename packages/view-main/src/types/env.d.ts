/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference types="svelte" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_IS_WEB?: string
  readonly VITE_IS_DESKTOP?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'svelte' {
  export type ComponentExports<TComponent extends Component<any, any>> =
    TComponent extends Component<any, infer TExports> ? TExports : never
}
