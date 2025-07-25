import { defineStore } from 'pinia'

const useSceneStore = defineStore('scene', {
  state: () => ({
    scene: undefined as Scene | undefined,
  }),
  // actions: {
  //   // addObject(object: SceneObject) {
  //   //   if (this.scene) {
  //   //     this.scene.objects.push(object)
  //   //   }
  //   // },
  // },
})

export default useSceneStore
