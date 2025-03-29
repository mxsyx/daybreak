import { defineStore } from 'pinia'

export const useSceneStore = defineStore('scene', {
  state: () => ({
    scene: undefined as Scene | undefined,
  }),
})
