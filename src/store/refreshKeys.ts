import { defineStore } from 'pinia'

const useRefreshKeysStore = defineStore('refreshKeys', {
  state: () => ({
    images: 0,
    videos: 0,
    audios: 0,
  }),
  actions: {
    refreshImages() {
      this.images = Math.random()
    },
    refreshVideos() {
      this.videos = Math.random()
    },
    refreshAudios() {
      this.audios = Math.random()
    },
  },
})

export default useRefreshKeysStore
