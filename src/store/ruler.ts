import Ruler from '@/layout/Main/Ruler'
import { defineStore } from 'pinia'
import { shallowRef, type ShallowRef } from 'vue'

const useRulerStore = defineStore<'ruler', { ruler: ShallowRef<Ruler | null> }>(
  'ruler',
  {
    state: () => ({
      ruler: shallowRef(null),
    }),
    actions: {},
  }
)

export default useRulerStore
