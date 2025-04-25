/* eslint-disable @typescript-eslint/naming-convention */
declare namespace AnyListen {
  interface CmdParams {
    /**
     * 搜索，启动软件时自动在搜索框搜索指定的内容，例如：-search="突然的自我 - 伍佰"
     */
    search?: string

    /**
     * 禁用硬件加速启动
     */
    dha?: boolean

    /**
     * 以非透明模式启动
     */
    dt?: boolean

    /**
     * 禁用硬件媒体密钥处理
     */
    dhmkh?: boolean

    /**
     * 设置代理服务器，代理应用的所有流量，例：-proxy-server="127.0.0.1:1081"（不支持设置账号密码，v1.17.0起新增）。注：应用内“设置-网络-代理设置”仅代理接口请求的流量，优先级更高
     */
    'proxy-server'?: string

    /**
     * 以分号分隔的主机列表绕过代理服务器，例：-proxy-bypass-list="<local>;*.google.com;*foo.com;1.2.3.4:5678"（与-proxy-server一起使用才有效，v1.17.0起新增）。注：此设置对应用内接口请求无效
     */
    'proxy-bypass-list'?: string

    /**
     * 启动时播放指定列表的音乐
     */
    play?: string

    /**
     * 启动开发者工具
     */
    odt?: boolean
  }

  // type QualityList = Partial<Record<AnyListen.Source, AnyListen.Quality[]>>

  interface EnvParams {
    cmdParams: CmdParams
  }

  interface TaskBarButtonFlags {
    empty: boolean
    collect: boolean
    play: boolean
    next: boolean
    prev: boolean
  }
  type TaskBarButtonActions = 'unCollect' | 'collect' | 'prev' | 'pause' | 'play' | 'next'
}
declare const __STATIC_PATH__: string
declare const __USER_API_PATH__: string
declare const __GIT_COMMIT__: string
declare const __GIT_COMMIT_DATE__: string
