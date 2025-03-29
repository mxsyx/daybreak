import { defineStore } from "pinia";

export const useSizeStore = defineStore("size", {
  state: () => ({
    size: {
      width: 1920,
      height: 1080,
      ratio: 1920 / 1080,
    } as Size, 
  }),
});
