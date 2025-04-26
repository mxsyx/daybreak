import { PRIMARY_COLOR } from '@/lib/constants'
import pixi from '@/pixi'
import {
  Assets,
  Circle,
  Container,
  type FederatedPointerEvent,
  Graphics,
  Point,
  Rectangle,
  Sprite,
  Texture,
  type ViewContainer,
} from 'pixi.js'
import {
  ANCHOR_FACTOR,
  FULL_HIT_AREA,
  RESIZE_CORNER_TRANSFORM_MODES,
  RESIZE_EDGE_TRANSFORM_MODES,
  RESIZE_TRANSFORM_MODES,
  type ResizeTransformMode,
  type TransformMode,
} from './constants'
import rotationIcon from '@/assets/icon-rotation.webp'

class Control {
  #obj: ViewContainer
  #container: Container
  #mask: Graphics
  #cornerAnchors: Graphics[] = []
  #edgeAnchors: Graphics[] = []
  #rotationAnchor!: Sprite

  constructor(obj: ViewContainer, initialEvent: FederatedPointerEvent) {
    this.#obj = obj

    let transformMode: TransformMode | null = 'translate'
    let pivotPoint: Point | null
    let startPoint: Point | null = initialEvent.global.clone()
    let startRotation = 0
    let startWidth = 0
    let startHeight = 0
    let aspectRatio = 1

    const container = new Container({
      eventMode: 'static',
    })
    pixi.stage.addChild(container)
    this.#container = container

    // Add mask
    const mask = new Graphics({
      eventMode: 'static',
    })
    container.addChild(mask)
    this.#mask = mask

    // Add corner anchors
    for (let i = 0; i < 4; i++) {
      const anchor = new Graphics({
        eventMode: 'static',
        hitArea: new Circle(0, 0, 15),
        cursor: i % 2 === 0 ? 'nwse-resize' : 'nesw-resize',
      })
        .circle(0, 0, 10)
        .fill(0xffffff)
        .on('mousedown', (e) => {
          e.stopPropagation()
          transformMode = RESIZE_CORNER_TRANSFORM_MODES[i]
          pivotPoint = obj.position.clone()
          startPoint = anchor.getGlobalPosition().clone()
          startWidth = obj.width
          startHeight = obj.height
          aspectRatio = obj.width / obj.height
          container.hitArea = FULL_HIT_AREA
        })
      container.addChild(anchor)
      this.#cornerAnchors.push(anchor)
    }

    // Add edge anchors
    for (let i = 0; i < 4; i++) {
      const anchor = new Graphics({
        eventMode: 'static',
        hitArea: new Rectangle(
          -4,
          -4,
          i % 2 === 0 ? 16 : 36,
          i % 2 === 0 ? 36 : 16
        ),
        cursor: i % 2 === 0 ? 'ew-resize' : 'ns-resize',
      })
        .roundRect(0, 0, i % 2 === 0 ? 8 : 28, i % 2 === 0 ? 28 : 8, 15)
        .fill(0xffffff)
        .stroke({ width: 1, color: 0x333333 })
        .on('mousedown', (e) => {
          e.stopPropagation()
          transformMode = RESIZE_EDGE_TRANSFORM_MODES[i]
          pivotPoint = obj.position.clone()
          startPoint = anchor.getGlobalPosition().clone()
          startWidth = obj.width
          startHeight = obj.height
          aspectRatio = obj.width / obj.height
          container.hitArea = FULL_HIT_AREA
        })
      container.addChild(anchor)
      this.#edgeAnchors.push(anchor)
    }

    // Add rotation anchor
    Assets.load(rotationIcon).then((texture: Texture) => {
      texture.source.autoGenerateMipmaps = true
      const sprite = new Sprite({
        texture,
        eventMode: 'static',
        cursor: 'grab',
        width: 36,
        height: 36,
      }).on('mousedown', (e) => {
        e.stopPropagation()
        transformMode = 'rotate'
        pivotPoint = obj.position.clone()
        startWidth = obj.width
        startHeight = obj.height
        startRotation = obj.rotation

        const halfWidth = startWidth / 2
        const halfHeight = startHeight / 2
        const cosRadians = Math.cos(startRotation)
        const sinRadians = Math.sin(startRotation)
        startPoint = new Point(
          pivotPoint.x + halfWidth * cosRadians - halfHeight * sinRadians,
          pivotPoint.y + halfWidth * sinRadians + halfHeight * cosRadians
        )
        pivotPoint = new Point(
          pivotPoint.x - halfWidth * (1 - cosRadians) - halfHeight * sinRadians,
          pivotPoint.y + halfWidth * sinRadians - halfHeight * (1 - cosRadians)
        )

        container.hitArea = FULL_HIT_AREA
      })
      container.addChild(sprite)
      this.#rotationAnchor = sprite

      this.#updateTransform()
    })

    container
      .on('mousedown', (e) => {
        transformMode = 'translate'
        pivotPoint = obj.position.clone()
        startPoint = e.global.clone()
        container.hitArea = FULL_HIT_AREA
      })
      .on('mousemove', (e) => {
        if (!startPoint || !pivotPoint) {
          return
        }

        const deltaX = e.globalX - startPoint.x
        const deltaY = e.globalY - startPoint.y

        if (transformMode === 'translate') {
          container.position
            .set(pivotPoint.x + deltaX, pivotPoint.y + deltaY)
            .copyTo(obj.position)
        } else if (
          transformMode &&
          RESIZE_TRANSFORM_MODES.includes(transformMode as ResizeTransformMode)
        ) {
          // prettier-ignore
          const { dx, dy, dw, dh } = ANCHOR_FACTOR[transformMode as ResizeTransformMode]

          let newWidth = startWidth + deltaX * dw

          let newHeight: number
          if (RESIZE_CORNER_TRANSFORM_MODES.includes(transformMode as any)) {
            newHeight = newWidth / aspectRatio
          } else {
            newHeight = startHeight + deltaY * dh
          }

          obj.setSize(newWidth, newHeight)
          container.position
            .set(
              pivotPoint.x + deltaX * dx,
              pivotPoint.y + (newHeight - startHeight) * dy * dh
            )
            .copyTo(obj.position)

          this.#updateTransform()
        } else if (transformMode === 'rotate') {
          const radians = Math.atan2(deltaY, deltaX) - Math.PI / 2

          obj.rotation = radians
          container.rotation = radians

          const halfWidth = startWidth / 2
          const halfHeight = startHeight / 2
          const cosRadians = Math.cos(radians)
          const sinRadians = Math.sin(radians)
          container.position
            .set(
              // prettier-ignore
              pivotPoint.x + halfWidth * (1 - cosRadians) + halfHeight * sinRadians,
              // prettier-ignore
              pivotPoint.y - halfWidth * sinRadians + halfHeight * (1 - cosRadians)
            )
            .copyTo(obj.position)
        }
      })

    container.onmouseup = container.onmouseupoutside = (e) => {
      transformMode = null
      pivotPoint = null
      startPoint = null
      container.hitArea = null
    }

    container.emit('mousedown', initialEvent)
  }

  #updateTransform() {
    const bounds = this.#obj.getBounds()

    this.#mask
      .clear()
      .rect(-2, -2, bounds.width + 4, bounds.height + 4)
      .fill('transparent')
      .stroke({ width: 4, color: PRIMARY_COLOR })

    this.#cornerAnchors.forEach((anchor, i) => {
      anchor.position.set(
        i === 0 || i === 3 ? 0 : bounds.width,
        i === 0 || i === 1 ? 0 : bounds.height
      )
    })

    this.#edgeAnchors.forEach((anchor, i) => {
      anchor.position.set(
        // prettier-ignore
        (i % 2 === 0 ? i / 2 : 0.5) * bounds.width + (i === 0 ? -6 : i === 2 ? -2 : -14),
        // prettier-ignore
        (i === 1 ? 0 : i === 3 ? 1 : 0.5) * bounds.height + (i === 1 ? -6 : i === 3 ? -2 : -14)
      )
    })

    this.#rotationAnchor.position.set(bounds.width / 2 - 18, bounds.height + 20)
  }

  destroy() {
    this.#container.destroy({ children: true })
  }
}

export default Control
