import type { AssetsEndpoints } from './asset'
import type { ImageEndpoints } from './image'
import type { SessionEndpoints } from './session'
import type { VideoEndpoints } from './video'

export type Endpoints = SessionEndpoints &
  AssetsEndpoints &
  ImageEndpoints &
  VideoEndpoints
