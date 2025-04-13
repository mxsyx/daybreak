import { Container, Sprite, Texture, type SpriteOptions } from 'pixi.js'
import { makeControl } from './utils'

export class ISprite extends Sprite {
  #control: Container

  constructor(options?: SpriteOptions | Texture) {
    super(options)

    this.#control = makeControl(this)
  }
}
