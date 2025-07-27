/// <reference types="vite/client" />

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
  range: [number, number]
  type: AssetType
  src: string
  id: number
}

type SceneObject = BaseObject

interface Vector {
  x: number
  y: number
}
