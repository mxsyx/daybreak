import { createGridWithAxes } from '@/lib/grid'
import { defineStore } from 'pinia'
import useAppStore from './app'

const useGridStore = defineStore('grid', {
  state: async () => {
    const app = await useAppStore().getApp()
    const { grid } = createGridWithAxes(app.screen.width, app.screen.height, 60)

    app.stage.addChild(grid)

    return {
      grid: grid,
    }
  },
  actions: {
    async toggle() {
      const { grid } = await this
      console.log(grid)

      grid.visible = !grid.visible
    },
  },
})

export default useGridStore
