import type { AssetsEndpoints } from './asset'
import type { AudioEndpoints } from './audio'
import type { ImageEndpoints } from './image'
import type { SessionEndpoints } from './session'
import type { VideoEndpoints } from './video'

export type Endpoints = SessionEndpoints &
  AssetsEndpoints &
  ImageEndpoints &
  VideoEndpoints &
  AudioEndpoints
