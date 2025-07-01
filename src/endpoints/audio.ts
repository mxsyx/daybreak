export interface AudioEndpoints {
  'v1/audios': {
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
