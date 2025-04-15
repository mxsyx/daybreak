import { PRIMARY_COLOR } from '@/lib/constants'
import pixi from '@/pixi'
import { Container, Graphics, Rectangle, type ViewContainer } from 'pixi.js'

export function makeControl(obj: ViewContainer) {
  const container = new Container({
    eventMode: 'static',
  })
  container.addChild(obj)

  let isSelected = false
  let isDragging = false
  let border: Graphics | null
  const cornerAnchors: Graphics[] = []
  const edgeAnchors: Graphics[] = []

  container.on('mousedown', () => {
    if (!isSelected) {
      const bounds = obj.getBounds()
      border = new Graphics()
      border.rect(
        bounds.x - 2,
        bounds.y - 2,
        bounds.width + 4,
        bounds.height + 4
      )
      console.log(bounds.x)

      border.stroke({ width: 2, color: PRIMARY_COLOR })
      container.addChild(border)

      // Add corner anchors
      for (let i = 0; i < 4; i++) {
        const anchor = new Graphics()
        anchor.circle(0, 0, 8)
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
        anchor.rect(0, 0, i % 2 === 0 ? 4 : 16, i % 2 === 0 ? 16 : 4)
        anchor.fill(0xffffff)
        anchor.x = bounds.x + (i % 2 === 0 ? i / 2 : 0.5) * bounds.width
        anchor.y = bounds.y + (i === 1 ? 0 : i === 3 ? 1 : 0.5) * bounds.height
        anchor.interactive = true
        edgeAnchors.push(anchor)
        container.addChild(anchor)
      }

      isSelected = true
    }

    isDragging = true
    container.hitArea = new Rectangle(-1920 / 2, -1080 / 2, 1920, 1080)
  })

  container.onmouseup = container.onmouseupoutside = () => {
    isDragging = false
    container.hitArea = null
  }

  container.on('mousemove', (e) => {
    if (!isDragging) {
      return
    }
    container.x = e.globalX - container.width / 2
    container.y = e.globalY - container.height / 2
  })

  pixi.stage.addChild(container)

  return container
}
