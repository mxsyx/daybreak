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
      border.stroke({ width: 2, color: PRIMARY_COLOR })
      container.addChild(border)
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
