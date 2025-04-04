import { Container, Graphics, Text, TextStyle } from 'pixi.js'

const AXES_TEXT_STYLE = new TextStyle({
  fill: 0x666666,
  fontSize: 28,
})

/**
 * The default size of the cell(1920x1080).
 */
const DEFAULT_CELL_SIZE = 60

/**
 * Create a ruler with axes.
 *
 * @param width The width of the ruler.
 * @param height The height of the ruler.
 * @param cellSize The size of the cell.
 */
export function createRuler(
  width: number,
  height: number,
  cellSize: number = DEFAULT_CELL_SIZE
) {
  const ruler = new Graphics()
  const axesX: Text[] = []
  const axesY: Text[] = []
  const quadrantLenX = width / 2
  const quadrantLenY = height / 2
  const axesSize = cellSize * (2 / 3)

  ruler.setStrokeStyle({ width: 1, color: 0x333333 })
  for (let x = cellSize; x < width; x += cellSize) {
    ruler
      .moveTo(x, 0)
      .lineTo(x, height - axesSize)
      .stroke()
    const label = Math.abs((x - quadrantLenX) / cellSize).toString()
    const text = new Text({
      text: label,
      style: AXES_TEXT_STYLE,
    })
    text.x = x - text.width / 2
    text.y = height - text.height - (axesSize - text.height) / 2
    axesX.push(text)
  }
  for (let y = cellSize; y < height; y += cellSize) {
    ruler.moveTo(axesSize, y).lineTo(width, y).stroke()
    const label = Math.abs((y - quadrantLenY) / cellSize).toString()
    const text = new Text({
      text: label,
      style: AXES_TEXT_STYLE,
    })
    text.x = (axesSize - text.width) / 2
    text.y = y - text.height / 2
    axesX.push(text)
  }

  const container = new Container()
  container.addChild(ruler, ...axesX, ...axesY)

  return container
}
