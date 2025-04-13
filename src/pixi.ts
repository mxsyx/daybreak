import { Application } from 'pixi.js'
import { initDevtools } from '@pixi/devtools'
import { Viewport } from 'pixi-viewport'

const pixi = new Application()

export let viewport: Viewport

export async function initPixi(width = 1920, height = 1080) {
  await pixi.init({ width, height })
  pixi.canvas.style.width = '100%'
  pixi.canvas.style.borderRadius = '4px'

  if (import.meta.env.DEV) {
    initDevtools({ app: pixi })
  }

  // viewport
  viewport = new Viewport({
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    worldWidth: width,
    worldHeight: height,
    events: pixi.renderer.events,
  })
  viewport.drag().pinch().wheel().decelerate()
  pixi.stage.addChild(viewport)
}

export default pixi
