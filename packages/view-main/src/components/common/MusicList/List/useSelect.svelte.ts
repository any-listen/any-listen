export const useSelect = <T extends object = AnyListen.Music.MusicInfo>(props: {
  isShiftDown: boolean
  list: T[]
  keyname?: keyof T
}) => {
  let selectedList: T[] = $state.raw([])
  let selectIndex = $state(0)

  return {
    get list() {
      const key = props.keyname
      if (!key) return selectedList
      const selectedIds = new Set(selectedList.map((item) => item[key]))
      return props.list.filter((item) => selectedIds.has(item[key]))
    },
    get selectIndex() {
      return selectIndex
    },
    clearSelect() {
      selectedList = []
    },
    setSelectIndex(idx: number) {
      selectIndex = idx
    },
    override(list: T[]) {
      selectedList = list
    },
    addOrRemove(info: T) {
      let idx = props.keyname
        ? selectedList.findIndex((selected) => selected[props.keyname!] === info[props.keyname!])
        : selectedList.indexOf(info)
      if (idx < 0) {
        selectedList = [...selectedList, info]
      } else {
        selectedList.splice(idx, 1)
        selectedList = [...selectedList]
      }
    },
    handleSelect(clickIndex: number) {
      let list = props.list
      if (props.isShiftDown) {
        if (selectIndex < 0) {
          selectIndex = clickIndex
          this.addOrRemove(list[clickIndex])
        } else {
          if (selectIndex == clickIndex) {
            selectedList = [list[clickIndex]]
          } else {
            if (selectedList.length) selectedList = []
            let _selectIndex = selectIndex
            let isNeedReverse = false
            if (clickIndex < _selectIndex) {
              let temp = _selectIndex
              _selectIndex = clickIndex
              clickIndex = temp
              isNeedReverse = true
            }
            let newSelectList = list.slice(_selectIndex, clickIndex + 1)
            if (isNeedReverse) newSelectList.reverse()
            selectedList = newSelectList
          }
        }
      } else {
        selectIndex = clickIndex
        this.addOrRemove(list[clickIndex])
      }
    },
  }
}
