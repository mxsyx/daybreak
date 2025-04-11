import { Application } from 'pixi.js'
import { initDevtools } from '@pixi/devtools'

const pixi = new Application()

export async function initPixi() {
  await pixi.init({
    width: 1920,
    height: 1080,
  })
  pixi.canvas.style.width = '100%'
  pixi.canvas.style.borderRadius = '4px'

  if (import.meta.env.DEV) {
    initDevtools({ app: pixi })
  }
}

export default pixi
