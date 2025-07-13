import { Application, EventEmitter } from 'pixi.js'
import { initDevtools } from '@pixi/devtools'

const pixi = new Application()
export const pixiOuter = new Application()

export const eventEmitter = new EventEmitter()

export async function initPixi(width = 1920, height = 1080) {
  await pixi.init({ width, height, antialias: true })

  await pixiOuter.init({
    width: width * 1.1,
    height: height * 1.1,
    antialias: true,
    background: 'hsl(240 15.49% 13.92%)',
  })

  if (import.meta.env.DEV) {
    initDevtools({ app: pixi })
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Delete') {
      eventEmitter.emit('delete')
    }
  })
}

export default pixi
