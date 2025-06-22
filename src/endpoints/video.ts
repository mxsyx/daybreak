export interface VideoEndpoints {
  'v1/videos': {
    POST: {
      payload: {
        key: string
        posterKey: string
        caption: string
        tags: string[]
      }
      params: {}
      data: {}
    }
  }
}
