import { Sprite, Texture, type SpriteOptions } from 'pixi.js'
import Control from './Control'
import { eventEmitter } from '@/pixi'
import useRulerStore from '@/store/ruler'

class ISprite extends Sprite {
  #control: Control | null = null
  #isSelected = false

  constructor(options?: SpriteOptions | Texture) {
    super(options)

    this.eventMode = 'static'

    this.on('mousedown', (e) => {
      if (!this.#isSelected) {
        this.#isSelected = true
        this.#control = new Control(this, e)
        const rulerStore = useRulerStore()
        this.#control.on('transform', (e) => {
          rulerStore.ruler?.highlight(e, this.#control!)
        })
      }
    })

    eventEmitter.on('delete', () => {
      if (this.#isSelected) {
        this.#control?.destroy()
        super.destroy()
      }
    })
  }
}

export default ISprite
