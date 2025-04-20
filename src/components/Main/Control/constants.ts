import { Rectangle } from 'pixi.js'

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

export type TransformMode = 'translate' | ResizeTransformMode | 'rotate'

export const FULL_HIT_AREA = new Rectangle(-1920, -1080, 1920 * 2, 1080 * 2)

export const ANCHOR_FACTOR: Record<
  ResizeTransformMode,
  {
    dx: 1 | 0
    dy: 1 | 0
    dw: 1 | -1 | 0
    dh: 1 | -1 | 0
  }
> = {
  resizeTL: {
    dx: 1,
    dy: 1,
    dw: -1,
    dh: -1,
  },
  resizeTR: {
    dx: 0,
    dy: 1,
    dw: 1,
    dh: -1,
  },
  resizeBR: {
    dx: 0,
    dy: 0,
    dw: 1,
    dh: 1,
  },
  resizeBL: {
    dx: 1,
    dy: 0,
    dw: -1,
    dh: -1,
  },
  resizeL: { dx: 1, dy: 0, dw: -1, dh: 0 },
  resizeT: { dx: 0, dy: 1, dw: 0, dh: -1 },
  resizeR: { dx: 0, dy: 0, dw: 1, dh: 0 },
  resizeB: { dx: 0, dy: 0, dw: 0, dh: 1 },
}
