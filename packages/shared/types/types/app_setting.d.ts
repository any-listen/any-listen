import type { Langs } from '@any-listen/i18n'

declare global {
  namespace AnyListen {
    type AddMusicLocationType = 'top' | 'bottom'

    interface AppSetting {
      version: string

      /**
       * 窗口大小id
       */
      'common.windowSizeId': number

      /**
       * 字体大小
       */
      'common.fontSize': number

      /**
       * 是否以全屏启动
       */
      'common.startInFullscreen': boolean

      /**
       * 语言id
       */
      'common.langId': Langs | null

      /**
       * 显示的字体
       */
      'common.font': string

      /**
       * 是否启用动画
       */
      'common.isShowAnimation': boolean

      /**
       * 是否同意软件协议
       */
      'common.isAgreePact': boolean

      /**
       * 播放栏进度条样式
       */
      'common.playBarProgressStyle': 'mini' | 'full' | 'middle' | 'centerControl' | 'centerControlMiddle' | 'centerControlFull'

      /**
       * 启用透明窗口
       */
      'common.transparentWindow': boolean

      /**
       * 尝试自动更新
       */
      'common.tryAutoUpdate': boolean

      /**
       * 是否启用预发布版本
       * @description 预发布版本是指在正式发布之前的版本，可能包含一些新功能或修复，但也可能不稳定
       */
      'common.allowPreRelease': boolean

      /**
       * 更新版本后是否显示变更日志
       */
      'common.showChangeLog': boolean

      /**
       * 是否启用回收站功能
       */
      'common.enableTrash': boolean

      /**
       * 启动时自动播放歌曲
       */
      'player.startupAutoPlay': boolean

      /**
       * 切歌模式
       */
      'player.togglePlayMethod': 'listLoop' | 'random' | 'list' | 'singleLoop' | 'none'

      /**
       * 优先播放的音质
       */
      'player.playQuality': '128k' | '320k' | 'flac' | 'flac24bit'

      /**
       * 是否显示任务栏进度条
       */
      'player.isShowTaskProgess': boolean

      /**
       * 音量大小
       */
      'player.volume': number

      /**
       * 是否静音
       */
      'player.isMute': boolean

      /**
       * 播放速率
       */
      'player.playbackRate': number

      /**
       * 是否自动调整音频的音高以补偿对播放速率设置所做的更改
       */
      'player.preservesPitch': boolean

      /**
       * 音频输出设备id
       */
      'player.mediaDeviceId': string

      /**
       * 是否在音频输出设备更改时暂停播放
       */
      'player.isMediaDeviceChangedPausePlay': boolean

      /**
       * 是否显示歌词翻译
       */
      'player.isShowLyricTranslation': boolean

      /**
       * 是否显示歌词罗马音
       */
      'player.isShowLyricRoma': boolean

      /**
       * 是否调换翻译歌词与罗马音歌词位置
       */
      'player.isSwapLyricTranslationAndRoma': boolean

      /**
       * 是否将歌词从简体转换为繁体
       */
      'player.isS2t': boolean

      /**
       * 是否播放卡拉OK歌词
       */
      'player.isPlayAwlrc': boolean

      /**
       * 启动软件时是否恢复上次播放进度
       */
      'player.isSavePlayTime': boolean

      /**
       * 是否启用音频可视化
       */
      'player.audioVisualization': boolean

      /**
       * 定时暂停播放-是否等待歌曲播放完毕再暂停
       */
      'player.waitPlayEndStop': boolean

      /**
       * 定时暂停播放-倒计时时间
       */
      'player.waitPlayEndStopTime': string

      /**
       * 环境音效文件名
       */
      'player.soundEffect.convolution.fileName': string | null

      /**
       * 环境音效原始输出增益
       */
      'player.soundEffect.convolution.mainGain': number

      /**
       * 环境音效输出增益
       */
      'player.soundEffect.convolution.sendGain': number

      /**
       * 均衡器 31hz 值
       */
      'player.soundEffect.biquadFilter.hz31': number

      /**
       * 均衡器 62hz 值
       */
      'player.soundEffect.biquadFilter.hz62': number

      /**
       * 均衡器 125hz 值
       */
      'player.soundEffect.biquadFilter.hz125': number

      /**
       * 均衡器 250hz 值
       */
      'player.soundEffect.biquadFilter.hz250': number

      /**
       * 均衡器 500hz 值
       */
      'player.soundEffect.biquadFilter.hz500': number

      /**
       * 均衡器 1000hz 值
       */
      'player.soundEffect.biquadFilter.hz1000': number

      /**
       * 均衡器 2000hz 值
       */
      'player.soundEffect.biquadFilter.hz2000': number

      /**
       * 均衡器 4000hz 值
       */
      'player.soundEffect.biquadFilter.hz4000': number

      /**
       * 均衡器 8000hz 值
       */
      'player.soundEffect.biquadFilter.hz8000': number

      /**
       * 均衡器 16000hz 值
       */
      'player.soundEffect.biquadFilter.hz16000': number

      /**
       * 3D立体环绕是否启用
       */
      'player.soundEffect.panner.enable': boolean

      /**
       * 3D立体环绕声音距离
       */
      'player.soundEffect.panner.soundR': number

      /**
       * 3D立体环绕速度
       */
      'player.soundEffect.panner.speed': number

      /**
       * 升降声调
       */
      'player.soundEffect.pitchShifter.playbackRate': number

      /**
       * 是否启用音频加载失败时自动切歌
       */
      'player.autoSkipOnError': boolean

      /**
       * 点击相同列表内的歌曲切歌时是否清空已播放列表（随机模式下列表内所有歌曲会重新参与随机）
       */
      'player.isAutoCleanPlayedList': boolean

      /**
       * 是否将歌词显示在状态栏（Mac可用）
       */
      'player.isShowStatusBarLyric': boolean

      /**
       * 是否将歌词显示在标题栏
       */
      'player.isShowTitleLyric': boolean

      /**
       * 是否将歌词显示在媒体控制界面
       */
      'player.isShowMediaSessionLyric': boolean

      /**
       * 播放详情页-是否缩放当前播放的歌词行
       */
      'playDetail.isZoomActiveLrc': boolean

      /**
       * 播放详情页-歌词字体大小
       */
      'playDetail.style.fontSize': number

      /**
       * 播放详情页-歌词对齐方式
       */
      'playDetail.style.align': 'center' | 'left' | 'right'

      /**
       * 播放详情页-歌词加粗
       */
      'playDetail.style.fontWeight': boolean

      /**
       * 播放详情页-是否延迟桌面歌词滚动
       */
      'playDetail.isDelayScroll': boolean

      /**
       * 播放详情页-是否使用动态背景
       */
      'playDetail.isDynamicBackground': boolean

      /**
       * 播放详情页-封面样式
       */
      'playDetail.coverStyle': 'cd' | 'square'

      /**
       * 是否显示歌曲来源（仅对我的列表有效）
       */
      'list.isShowSource': boolean

      /**
       * 是否自动恢复列表滚动位置（仅对我的列表有效）
       */
      'list.isSaveScrollLocation': boolean

      /**
       * 添加歌曲到我的列表时的方式
       */
      'list.addMusicLocationType': AddMusicLocationType

      /**
       * 下载路径
       */
      'download.savePath': string

      /**
       * 文件命名方式
       */
      'download.fileName': '%name% - %singer%' | '%singer% - %name%' | '%name%'

      /**
       * 主题id
       */
      'theme.id': string

      /**
       * 是否启用代理
       */
      'network.proxy.enable': boolean

      /**
       * 代理服务器地址
       */
      'network.proxy.host': string

      /**
       * 代理服务器端口号
       */
      'network.proxy.port': string

      /**
       * 是否启用托盘
       */
      'tray.enable': boolean

      /**
       * 托盘主题id
       */
      'tray.themeId': number

      /**
       * 扩展仓库地址
       */
      'extension.onlineExtensionHost': string

      /**
       * github 镜像站点地址列表
       */
      'extension.ghMirrorHosts': string
    }
  }
}
