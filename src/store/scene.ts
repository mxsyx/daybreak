import { defineStore } from 'pinia'

const useSceneStore = defineStore('scene', {
  state: () => ({
    scene: undefined as Scene | undefined,
  }),
})

export default useSceneStore
