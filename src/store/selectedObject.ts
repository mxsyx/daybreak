import { defineStore } from 'pinia'

// 定义 selectedObject store
export const useSelectedObjectStore = defineStore('selectedObject', {
  state: () => ({
    selectedObject: undefined as SceneObject | undefined, // 对应 selectedObjectAtom
  }),
})
