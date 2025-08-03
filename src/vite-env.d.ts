/// <reference types="vite/client" />

import type { ViewContainer } from 'pixi.js'
import type { Raw } from 'vue'

declare global {
  type Dict<T = any> = Record<string, T>

  type ReactFC<T = unknown> = React.FC<T & { children: React.ReactNode }>

  interface TextGrid {
    type: 'grid'
    start: number
    end: number
    text: string
    scene?: string
  }

  interface Scene {
    type: 'scene'
    grids: TextGrid[]
    objects: SceneObject[]
  }

  interface Size {
    width: number
    height: number
    ratio: number
  }

  type AssetType = 1 | 2 | 3

  interface BaseObject {
    x: number
    y: number
    width: number
    height: number
    interval: [number, number]
    type: AssetType
    src: string
    id: number
    target: Raw<ViewContainer>
  }

  type SceneObject = BaseObject

  interface Vector {
    x: number
    y: number
  }
}
