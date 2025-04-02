import { defineStore } from 'pinia'

const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 1,
  }),
  actions: {
    increment() {
      this.count++
    },
  },
})

export default useCounterStore
