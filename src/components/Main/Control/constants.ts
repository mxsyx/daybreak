import { Rectangle, type PointData } from 'pixi.js'

export const RESIZE_CORNER_TRANSFORM_MODES = [
  'resizeTL',
  'resizeTR',
  'resizeBR',
  'resizeBL',
] as const
export const RESIZE_EDGE_TRANSFORM_MODES = [
  'resizeL',
  'resizeT',
  'resizeR',
  'resizeB',
] as const
export const RESIZE_TRANSFORM_MODES = [
  ...RESIZE_CORNER_TRANSFORM_MODES,
  ...RESIZE_EDGE_TRANSFORM_MODES,
] as const

export type ResizeTransformMode = (typeof RESIZE_TRANSFORM_MODES)[number]

export type TransformMode =
  | 'translate'
  | 'translateOuter'
  | ResizeTransformMode
  | 'rotate'

export const FULL_HIT_AREA = new Rectangle(-1920, -1080, 1920 * 2, 1080 * 2)

export type AnchorIndex = 0 | 1 | 2 | 3

/**
 * The sequence of cursors that should be used for the resize handles.
 *
 * The cursors are used in the order they are listed here, starting from the
 * top left and going clockwise.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/cursor
 */
export const CURSOR_SEQ = [
  // Top left
  'nwse-resize',
  // Top
  'ns-resize',
  // Top right
  'nesw-resize',
  // Right
  'ew-resize',
  // Bottom right
  'nwse-resize',
  // Bottom
  'ns-resize',
  // Bottom left
  'nesw-resize',
  // Left
  'ew-resize',
] as const

export const STROKE_WIDTH = 4

export const PI_1_2 = Math.PI / 2

export interface TransformEvent {
  transformMode: TransformMode
  position: PointData
  ratation: number
}
