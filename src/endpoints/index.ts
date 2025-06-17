import type { AssetsEndpoints } from './asset'
import type { ImageEndpoints } from './image'
import type { SessionEndpoints } from './session'

export type Endpoints = SessionEndpoints & AssetsEndpoints & ImageEndpoints
