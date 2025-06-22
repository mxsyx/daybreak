export interface AssetsEndpoints {
  'v1/files': {
    POST: {
      payload: {
        file: File
      }
      params: {}
      data: {}
    }
  }
  'v1/assets': {
    GET: {
      payload: {}
      params: {
        page: number
        type: (typeof AssetTypeEnum)[keyof typeof AssetTypeEnum]
      }
      data: Asset[]
    }
  }
}

export interface Asset {
  id: string
  version: number
  score: number
  payload: {
    url: string
    caption: string
    tags: string[]
    type: number
    poster: string
  }
}

export const AssetTypeEnum = {
  IMAGE: 1,
  VIDEO: 2,
  AUDIO: 3,
} as const

export type AssetType = (typeof AssetTypeEnum)[keyof typeof AssetTypeEnum]
