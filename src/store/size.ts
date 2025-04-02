import { defineStore } from 'pinia'

const useSizeStore = defineStore('size', {
  state: () => ({
    size: {
      width: 1920,
      height: 1080,
      ratio: 1920 / 1080,
    } as Size,
  }),
})

export default useSizeStore
