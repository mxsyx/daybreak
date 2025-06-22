export interface ImageEndpoints {
  'v1/image/captions': {
    POST: {
      payload: {
        key: string
      }
      params: {}
      data: {
        caption: string
      }
    }
  }
  'v1/images': {
    POST: {
      payload: {
        key: string
        caption: string
        tags: string[]
      }
      params: {}
      data: {}
    }
  }
}
