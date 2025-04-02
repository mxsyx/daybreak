import { defineStore } from 'pinia'
import { Application } from 'pixi.js'
import { initDevtools } from '@pixi/devtools'

let initPromiseResolver: (value: boolean) => void

const useAppStore = defineStore('counter', {
  state: () => ({
    app: new Application(),
    __initPromise: new Promise((resolve) => {
      initPromiseResolver = resolve
    }),
  }),
  actions: {
    async getApp() {
      await this.__initPromise
      return this.app
    },
    async init() {
      await this.app.init({
        width: 1920,
        height: 1080,
        canvas: document.getElementById('canvas') as HTMLCanvasElement,
      })
      initPromiseResolver(true)

      if (import.meta.env.DEV) {
        initDevtools({ app: this.app as Application })
      }
    },
  },
})

export default useAppStore
