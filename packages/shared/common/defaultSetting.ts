const defaultSetting: AnyListen.AppSetting = {
  version: '1.0.2',

  'common.windowSizeId': 3,
  'common.fontSize': 16,
  'common.startInFullscreen': false,
  'common.langId': null,
  'common.font': '',
  'common.isShowAnimation': true,
  'common.isAgreePact': false,
  'common.playBarProgressStyle': 'centerControl',
  'common.transparentWindow': true,
  'common.tryAutoUpdate': true,
  'common.allowPreRelease': false,
  'common.showChangeLog': true,
  'common.enableTrash': true,

  'player.startupAutoPlay': false,
  'player.togglePlayMethod': 'listLoop',
  'player.playQuality': '128k',
  'player.isShowTaskProgess': true,
  'player.volume': 1,
  'player.isMute': false,
  'player.playbackRate': 1,
  'player.preservesPitch': true,
  'player.mediaDeviceId': 'default',
  'player.isMediaDeviceChangedPausePlay': false,
  'player.isShowLyricTranslation': false,
  'player.isShowLyricRoma': false,
  'player.isSwapLyricTranslationAndRoma': false,
  'player.isS2t': false,
  'player.isPlayAwlrc': true,
  'player.isSavePlayTime': true,
  'player.audioVisualization': false,
  'player.waitPlayEndStop': true,
  'player.waitPlayEndStopTime': '',
  'player.autoSkipOnError': true,
  'player.isAutoCleanPlayedList': false,
  'player.isShowStatusBarLyric': false,
  'player.isShowTitleLyric': false,
  'player.isShowMediaSessionLyric': false,
  'player.soundEffect.convolution.fileName': '',
  'player.soundEffect.convolution.mainGain': 10,
  'player.soundEffect.convolution.sendGain': 0,
  'player.soundEffect.biquadFilter.hz31': 0,
  'player.soundEffect.biquadFilter.hz62': 0,
  'player.soundEffect.biquadFilter.hz125': 0,
  'player.soundEffect.biquadFilter.hz250': 0,
  'player.soundEffect.biquadFilter.hz500': 0,
  'player.soundEffect.biquadFilter.hz1000': 0,
  'player.soundEffect.biquadFilter.hz2000': 0,
  'player.soundEffect.biquadFilter.hz4000': 0,
  'player.soundEffect.biquadFilter.hz8000': 0,
  'player.soundEffect.biquadFilter.hz16000': 0,
  'player.soundEffect.panner.enable': false,
  'player.soundEffect.panner.soundR': 5,
  'player.soundEffect.panner.speed': 50,
  'player.soundEffect.pitchShifter.playbackRate': 1,

  'playDetail.isZoomActiveLrc': true,
  'playDetail.style.fontSize': 100,
  'playDetail.style.align': 'left',
  'playDetail.style.fontWeight': true,
  'playDetail.isDelayScroll': true,
  'playDetail.isDynamicBackground': true,
  'playDetail.coverStyle': 'cd',

  'list.isShowSource': true,
  'list.isSaveScrollLocation': true,
  'list.addMusicLocationType': 'top',

  'download.savePath': '',
  'download.fileName': '%name% - %singer%',

  'network.proxy.enable': false,
  'network.proxy.host': '',
  'network.proxy.port': '',

  'tray.enable': false,
  // 'tray.isToTray': false,
  'tray.themeId': 1,

  // 'theme.id': 'blue_plus',
  'theme.id': 'blue2',

  'extension.onlineExtensionHost': '',
  'extension.ghMirrorHosts': 'https://ghproxy.net\nhttps://gh-proxy.com\nhttps://ghproxy.cn\nhttps://github.moeyy.xyz',
}

// 使用新年皮肤
if (new Date().getMonth() < 2) {
  defaultSetting['theme.id'] = 'happy_new_year'
  // defaultSetting['desktopLyric.style.lyricPlayedColor'] = 'rgba(255, 57, 71, 1)'
}

export default defaultSetting
