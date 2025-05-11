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
import {
  DIRECTIONS,
  PI_1_2,
  STROKE_WIDTH,
  type Directions,
  type TransformEvent,
} from '../Control/constants'

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

  /**
   * Array of graphics objects used to highlight grid lines.
   * These lines are highlighted based on user interactions.
   */
  #hightlightLines: Graphics[]

  #hightlightTarget: Control | null = null

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
    const highlightLines = [
      new Graphics(),
      new Graphics(),
      new Graphics(),
      new Graphics(),
    ]
    const quadrantLenX = width / 2
    const quadrantLenY = height / 2
    const axesSize = this.#getAxesSize()

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
    container.addChild(grid, ...axesX, ...axesY, ...highlightLines)

    this.container = container
    this.#hightlightLines = highlightLines
  }

  get visiable() {
    return this.container.visible
  }

  set visiable(value: boolean) {
    this.container.visible = value
    if (!value) {
      this.#clearHightlight()
    }
  }

  /**
   * Clear the highlight of the grid line.
   *
   * It will clear all the highlighted grid lines.
   */
  #clearHightlight() {
    this.#hightlightLines.forEach((line) => {
      line.clear()
    })
  }

  /**
   * Highlights a grid line with the given coordinates.
   *
   * It will set the stroke style of the line to the {@link PRIMARY_COLOR} with a width of {@link STROKE_WIDTH}.
   * @param line The graphics object which represents the grid line to highlight.
   * @param x1 The starting x coordinate of the line.
   * @param y1 The starting y coordinate of the line.
   * @param x2 The ending x coordinate of the line.
   * @param y2 The ending y coordinate of the line.
   */
  #highlight(line: Graphics, x1: number, y1: number, x2: number, y2: number) {
    line
      .clear()
      .moveTo(x1, y1)
      .lineTo(x2, y2)
      .stroke({ width: STROKE_WIDTH, color: PRIMARY_COLOR })
  }

  /**
   * Get the size of the axes.
   *
   * The size of the axes is equal to the cell size multiplied by the height of the axes text.
   * @returns The size of the axes.
   */
  #getAxesSize() {
    return this.#cellSize * AXES_TEXT_HEIGHT
  }

  /**
   * Highlights the grid line of the ruler according to the given pivot point and the direction of the control.
   *
   * It will highlight the grid line if the pivot point is within the {@link HIGHTLIGHT_THRESHOLD} distance from the grid line.
   * The control will also be snapped to the highlighted grid line.
   * @param pivotPoint The pivot point of the control.
   * @param lineIndex The index of the grid line to highlight.
   * @param inDirection Whether the pivot point is moving in the direction of the control.
   * @param control The control whose size is used to determine the position of the highlighted grid line.
   */
  #highlightByPosition(
    pivotPoint: PointData,
    lineIndex: number,
    inDirection: boolean,
    control: Control
  ) {
    const cellSize = this.#cellSize
    const axesSize = this.#getAxesSize()
    const highlightLine = this.#hightlightLines[lineIndex]

    let p: number
    let idx: number
    if (lineIndex === 0) {
      p = pivotPoint.x
    } else if (lineIndex === 1) {
      p = pivotPoint.y
    } else if (lineIndex === 2) {
      p = pivotPoint.x + control.size.width
    } else {
      p = pivotPoint.y + control.size.height
    }
    const delta = p % cellSize

    if (delta < HIGHTLIGHT_THRESHOLD) {
      idx = Math.floor(p / cellSize)
    } else if (delta > cellSize - HIGHTLIGHT_THRESHOLD) {
      idx = Math.ceil(p / cellSize)
    } else {
      highlightLine.clear()
      return
    }

    if (inDirection) {
      const xy = cellSize * idx - STROKE_WIDTH / 2
      if (lineIndex % 2 === 0) {
        this.#highlight(highlightLine, xy, 0, xy, this.#height - axesSize)
        control.stickToEdge({
          x: xy - (lineIndex === 0 ? 0 : control.size.width),
        })
      } else {
        this.#highlight(highlightLine, axesSize, xy, this.#width, xy)
        control.stickToEdge({
          y: xy - (lineIndex === 1 ? 0 : control.size.height),
        })
      }
    }
  }

  /**
   * Highlights the grid lines of the ruler according to the given position and directions.
   *
   * @param position The position of the control.
   * @param directions The directions of the control.
   * @param control The control whose position and rotation are used to determine the highlight.
   */
  #highlightByTranslate(
    position: PointData,
    directions: Directions,
    control: Control
  ) {
    this.#hightlightLines.forEach((_, i) => {
      this.#highlightByPosition(
        position,
        i,
        directions.indexOf(DIRECTIONS[i]) !== -1,
        control
      )
    })
  }

  /**
   * Highlights the grid lines of the ruler according to the given rotation and control.
   *
   * If the rotation is within the {@link HIGHTLIGHT_THRESHOLD} distance from one of the four axes,
   * the highlight is shown as a line along the rotated axes around the given position.
   * The line is highlighted if the rotation is within the
   * {@link HIGHTLIGHT_THRESHOLD} distance from one of the four axes.
   *
   * @param rotation The rotation of the control.
   * @param control The control whose position and rotation are used to determine the highlight.
   */
  #highlightByRotation(rotation: number, control: Control) {
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

      const highlightLine = this.#hightlightLines[idx]
      const axesSize = this.#getAxesSize()
      let x1: number
      let y1: number
      let x2: number
      let y2: number
      if (idx % 2 === 0) {
        x1 = control.position.x
        y1 = 0
        x2 = x1
        y2 = this.#height - axesSize
      } else {
        x1 = axesSize
        y1 = control.position.y
        x2 = this.#width
        y2 = y1
      }

      this.#clearHightlight()
      this.#highlight(highlightLine, x1, y1, x2, y2)
      setTimeout(() => {
        highlightLine.clear()
      }, 300)
    }
  }

  /**
   * Highlights the grid lines of the ruler during a resize operation by translating the position.
   *
   * This method is used to determine the highlight based on the current position and directions
   * during a resize event. It utilizes the translation logic to decide which grid lines to highlight.
   *
   * @param position The current position of the control being resized.
   * @param directions The directions in which the control is being resized.
   * @param control The control that is being resized and whose position is used to determine the highlight.
   */
  #highlightByResize(
    position: PointData,
    directions: Directions,
    control: Control
  ) {
    this.#highlightByTranslate(position, directions, control)
  }

  /**
   * Highlights the grid lines of the ruler according to the given transform event.
   *
   * If the transform mode is 'translate', the highlight is shown as a line along the x and y axes
   * around the given position. The line is highlighted if the mouse position is within the
   * {@link HIGHTLIGHT_THRESHOLD} distance from the grid line.
   *
   * If the transform mode is 'rotate', the highlight is shown as a line along the rotated axes
   * around the given position. The line is highlighted if the rotation is within the
   * {@link HIGHTLIGHT_THRESHOLD} distance from one of the four axes.
   *
   * @param e The transform event that triggered the highlight.
   * @param control The control whose position and rotation are used to determine the highlight.
   */
  highlight(e: TransformEvent, control: Control) {
    if (this.#hightlightTarget !== control) {
      this.#clearHightlight()
      this.#hightlightTarget = control
    }

    if (e.transformMode === 'translate') {
      this.#highlightByTranslate(e.position, e.directions, control)
    } else if (e.transformMode === 'rotate') {
      this.#highlightByRotation(e.rotation, control)
    } else {
      this.#highlightByResize(e.position, e.directions, control)
    }
  }

  unhighlight(control: Control) {
    if (this.#hightlightTarget === control) {
      this.#clearHightlight()
      this.#hightlightTarget = null
    }
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
