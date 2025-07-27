import { defineStore } from 'pinia'

interface State {
  scenes: Scene[]
  scene: Scene | null
  object: SceneObject | null
}

interface Actions {
  addObject: (object: SceneObject) => void
  removeObject: (id: number) => void
  selectObject: (id: number) => void
  deselectObject: (id: number) => void
}

const useEditingStore = defineStore<'editing', State, {}, Actions>('editing', {
  state: () => ({
    scenes: [],
    scene: null,
    object: null,
  }),
  actions: {
    addObject(object: SceneObject) {
      if (this.scene) {
        this.scene.objects.push(object)
      }
    },
    removeObject(id: number) {
      if (this.scene) {
        this.scene.objects = this.scene.objects.filter((o) => o.id !== id)
      }
      if (this.object?.id === id) {
        this.object = null
      }
    },
    selectObject(id: number) {
      if (this.scene) {
        this.object = this.scene.objects.find((o) => o.id === id) ?? null
      }
    },
    deselectObject(id: number) {
      if (this.object?.id === id) {
        this.object = null
      }
    },
  },
})

export default useEditingStore
