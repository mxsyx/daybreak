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
}
