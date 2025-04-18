import { PRIMARY_COLOR } from '@/lib/constants'
import pixi from '@/pixi'
import {
  Container,
  Graphics,
  Point,
  Rectangle,
  type ViewContainer,
} from 'pixi.js'

export function makeControl(obj: ViewContainer) {
  const container = new Container({
    eventMode: 'static',
  })
  container.addChild(obj)

  let isSelected = false
  let isDragging = false
  let startPoint: Point | null
  let dragStartPoint: Point | null
  let border: Graphics | null
  const cornerAnchors: Graphics[] = []
  const edgeAnchors: Graphics[] = []

  container.on('mousedown', (e) => {
    if (!isSelected) {
      const bounds = obj.getBounds()
      border = new Graphics()
      border.rect(
        bounds.x - 2,
        bounds.y - 2,
        bounds.width + 4,
        bounds.height + 4
      )

      border.stroke({ width: 4, color: PRIMARY_COLOR })
      container.addChild(border)

      // Add corner anchors
      for (let i = 0; i < 4; i++) {
        const anchor = new Graphics()
        anchor.circle(0, 0, 10)
        anchor.fill(0xffffff)
        anchor.x = i % 2 === 0 ? bounds.x : bounds.x + bounds.width
        anchor.y = i > 1 ? bounds.y + bounds.height : bounds.y
        anchor.interactive = true
        cornerAnchors.push(anchor)
        container.addChild(anchor)
      }

      // Add edge anchors
      for (let i = 0; i < 4; i++) {
        const anchor = new Graphics()
        anchor.roundRect(0, 0, i % 2 === 0 ? 8 : 28, i % 2 === 0 ? 28 : 8, 15)
        anchor.fill(0xffffff)
        // prettier-ignore
        anchor.x = bounds.x + (i % 2 === 0 ? i / 2 : 0.5) * bounds.width + (i === 0 ? -6 : i === 2 ? -2 : -14)
        // prettier-ignore
        anchor.y = bounds.y + (i === 1 ? 0 : i === 3 ? 1 : 0.5) * bounds.height + (i === 1 ? -6 : i === 3 ? -2 : -14)
        anchor.stroke({ width: 1, color: 0x333333 })
        anchor.interactive = true
        edgeAnchors.push(anchor)
        container.addChild(anchor)
      }

      isSelected = true
    }

    isDragging = true
    startPoint = container.position.clone()
    dragStartPoint = e.global.clone()
    container.hitArea = new Rectangle(-1920 / 2, -1080 / 2, 1920, 1080)
  })

  container.onmouseup = container.onmouseupoutside = () => {
    isDragging = false
    startPoint = null
    dragStartPoint = null
    container.hitArea = null
  }

  container.on('mousemove', (e) => {
    if (!isDragging || !startPoint || !dragStartPoint) {
      return
    }

    container.x = startPoint.x + (e.globalX - dragStartPoint.x)
    container.y = startPoint.y + (e.globalY - dragStartPoint.y)
  })

  pixi.stage.addChild(container)

  return container
}
