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
        const control = new Control(this, e)
        const { ruler } = useRulerStore()
        control
          .on('transform', (e) => {
            if (ruler && ruler.visiable) {
              ruler.highlight(e, control)
            }
          })
          .on('destroy', () => {
            if (ruler) {
              ruler.unhighlight(control)
            }
          })
        this.#control = control
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
