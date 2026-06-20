import defaultSetting from '@any-listen/common/defaultSetting'

export interface InitState {
  setting: AnyListen.AppSetting
}

// const empty = {}
export const settingState: InitState = {
  setting: { ...defaultSetting },
}
