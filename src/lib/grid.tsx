import { Graphics } from 'pixi.js'

/**
 * Create a grid with axes.
 *
 * @param width The width of the grid.
 * @param height The height of the grid.
 * @param cellSize The size of the cell.
 */
export function createGridWithAxes(
  width: number,
  height: number,
  cellSize: number
) {
  const grid = new Graphics()
  const axesX: number[] = []
  const axesY: number[] = []

  grid.setStrokeStyle({ width: 1, color: 0xffffff })
  for (let x = cellSize; x < width; x += cellSize) {
    grid.moveTo(x, 0).lineTo(x, height).stroke()
    axesX.push(x)
  }
  for (let y = cellSize; y < height; y += cellSize) {
    grid.moveTo(0, y).lineTo(width, y).stroke()
    axesY.push(y)
  }

  return { grid, axesX, axesY }
}
