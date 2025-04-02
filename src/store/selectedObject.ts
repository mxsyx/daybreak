import { defineStore } from 'pinia'

const useSelectedObjectStore = defineStore('selectedObject', {
  state: () => ({
    selectedObject: undefined as SceneObject | undefined, // 对应 selectedObjectAtom
  }),
})

export default useSelectedObjectStore
