import {
  Container,
  Graphics,
  PI_2,
  Text,
  TextStyle,
  type PointData,
} from 'pixi.js'

import { PRIMARY_COLOR } from '@/lib/constants'

import type Control from '../Control'
import { PI_1_2, STROKE_WIDTH, type TransformEvent } from '../Control/constants'

/**
 * Text style configuration for axis labels.
 * It defines the color and font size of the text.
 */
const AXES_TEXT_STYLE = new TextStyle({
  fill: 0x666666,
  fontSize: 28,
})

/**
 * The height ratio of the axis text relative to its container.
 */
const AXES_TEXT_HEIGHT = 2 / 3

/**
 * The default size of the cell(1920x1080).
 */
const DEFAULT_CELL_SIZE = 60

/**
 * The threshold of distance between the mouse position and the grid line.
 * When the position is within this distance, the line is highlighted.
 */
const HIGHTLIGHT_THRESHOLD = 5

class Ruler {
  readonly container: Container
  #width: number
  #height: number
  #cellSize: number
  #hightlightLineX: Graphics
  #hightlightLineY: Graphics

  /**
   * Create a ruler with axes.
   *
   * @param width The width of the ruler.
   * @param height The height of the ruler.
   * @param cellSize The size of the cell.
   */
  constructor(
    width: number,
    height: number,
    cellSize: number = DEFAULT_CELL_SIZE
  ) {
    this.#width = width
    this.#height = height
    this.#cellSize = cellSize

    const grid = new Graphics()
    const axesX: Text[] = []
    const axesY: Text[] = []
    const highlightLineX = new Graphics()
    const highlightLineY = new Graphics()
    const quadrantLenX = width / 2
    const quadrantLenY = height / 2
    const axesSize = cellSize * AXES_TEXT_HEIGHT

    grid.setStrokeStyle({ width: 1, color: 0x333333 })
    for (let x = cellSize; x < width; x += cellSize) {
      grid
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
      grid.moveTo(axesSize, y).lineTo(width, y).stroke()
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
    container.addChild(grid, ...axesX, ...axesY, highlightLineX, highlightLineY)

    this.container = container
    this.#hightlightLineX = highlightLineX
    this.#hightlightLineY = highlightLineY
  }

  highlight(e: TransformEvent, control: Control) {
    if (e.transformMode === 'translate') {
      this.#highlightByPosition(e.position, control)
    } else if (e.transformMode === 'rotate') {
      this.#highlightByRotation(e.ratation, e.position, control)
    }
  }

  /**
   * Highlights the grid lines around the given position.
   * The highlight is shown as a line along the x and y axes.
   * The line is highlighted if the mouse position is within the {@link HIGHTLIGHT_THRESHOLD} distance
   * from the grid line.
   *
   * @param position The position to highlight the lines around.
   * @param control The control to which the highlight is associated.
   */
  #highlightByPosition(position: PointData, control: Control) {
    const cellSize = this.#cellSize
    const axesSize = cellSize * AXES_TEXT_HEIGHT
    const deltaX = position.x % cellSize
    const deltaY = position.y % cellSize
    let xIdx = -1
    let yIdx = -1

    if (deltaX < HIGHTLIGHT_THRESHOLD) {
      xIdx = Math.floor(position.x / cellSize)
    } else if (deltaX > cellSize - HIGHTLIGHT_THRESHOLD) {
      xIdx = Math.ceil(position.x / cellSize)
    } else {
      this.#hightlightLineX.clear()
    }
    if (deltaY < HIGHTLIGHT_THRESHOLD) {
      yIdx = Math.floor(position.y / cellSize)
    } else if (deltaY > cellSize - HIGHTLIGHT_THRESHOLD) {
      yIdx = Math.ceil(position.y / cellSize)
    } else {
      this.#hightlightLineY.clear()
    }

    if (xIdx !== -1) {
      const x = cellSize * xIdx - STROKE_WIDTH / 2
      this.#hightlightLineX
        .clear()
        .moveTo(x, 0)
        .lineTo(x, this.#height - axesSize)
        .stroke({ width: STROKE_WIDTH, color: PRIMARY_COLOR })
      control.stickToEdge({ x })
    }
    if (yIdx !== -1) {
      const y = cellSize * yIdx - STROKE_WIDTH / 2
      this.#hightlightLineY
        .clear()
        .moveTo(axesSize, y)
        .lineTo(this.#width, y)
        .stroke({ width: STROKE_WIDTH, color: PRIMARY_COLOR })
      control.stickToEdge({ y })
    }
  }

  #highlightByRotation(
    rotation: number,
    position: PointData,
    control: Control
  ) {
    if (rotation < 0) {
      rotation += PI_2
    }

    let idx = -1
    const delta = rotation % PI_1_2
    if (delta < Math.PI / 36) {
      idx = Math.floor(rotation / PI_1_2)
    } else if (delta > PI_1_2 - Math.PI / 36) {
      idx = Math.ceil(rotation / PI_1_2) % 4
    }

    if (idx !== -1) {
      control.stickToEdge(idx * PI_1_2)
    }

    this.#highlightByPosition(position, control)
  }

  /**
   * Destroys the ruler container and all of its children, effectively
   * removing the ruler from the stage.
   */
  destroy() {
    this.container.destroy({ children: true })
  }
}

export default Ruler
