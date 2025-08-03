import pixi from '@/pixi'
import useEditingStore, { intervalTree } from '@/store/editing'
import { Muxer as WebMMuxer, ArrayBufferTarget } from 'webm-muxer'

const flushStage = (frame: number) => {
  const intervals = intervalTree
    .findOverlapping(frame)
    .filter((interval) => interval.data.type === 'object')

  const map: Dict = {}

  pixi.stage.children.forEach((child) => {
    map[child.uid] = child
  })

  intervals.forEach((interval) => {
    const object = map[interval.data.id]
    if (object) {
      object.visible = true
      delete map[interval.data.id]
    }
  })

  Object.values(map).forEach((object) => {
    object.visible = false
  })
}

export async function exportVideo() {
  const editingStore = useEditingStore()

  // 创建 canvas（可换为 Pixi.js 的 app.view）
  const canvas = pixi.canvas

  // 视频参数
  const width = canvas.width
  const height = canvas.height
  const fps = 60

  // 创建 ArrayBufferTarget 实例
  const target = new ArrayBufferTarget()

  // WebM 封装器
  const muxer = new WebMMuxer({
    target: target, // 使用 Target 实例
    video: {
      width,
      height,
      frameRate: fps,
      codec: 'V_VP8',
    },
  })

  // 创建编码器的 Promise 包装
  const createEncoder = () => {
    return new Promise<void>((resolve, reject) => {
      let frameCount = 0

      const encoder = new VideoEncoder({
        output: (chunk) => {
          muxer.addVideoChunk(chunk)
          frameCount++

          console.log(frameCount)

          // 当所有帧都编码完成时
          if (frameCount >= editingStore.totalFrame) {
            encoder
              .flush()
              .then(() => {
                encoder.close()
                resolve()
              })
              .catch(reject)
          }
        },
        error: (err) => {
          console.error('VideoEncoder error:', err)
          reject(err)
        },
      })

      // 检查编码器支持
      VideoEncoder.isConfigSupported({
        codec: 'vp8',
        width,
        height,
        bitrate: 2_000_000,
        framerate: fps,
      })
        .then((support) => {
          if (!support.supported) {
            reject(new Error('VP8 codec not supported'))
            return
          }

          encoder.configure({
            codec: 'vp8',
            width,
            height,
            bitrate: 2_000_000,
            framerate: fps,
          })

          // 逐帧绘制 + 编码
          for (let i = 0; i < editingStore.totalFrame; i++) {
            flushStage(i)
            const timestamp = (i * 1_000_000) / fps // 微秒
            const frame = new VideoFrame(canvas, {
              timestamp,
              duration: 1_000_000 / fps, // 添加帧持续时间
            })
            encoder.encode(frame, { keyFrame: i === 0 })
            frame.close() // 释放资源
          }
        })
        .catch(reject)
    })
  }

  try {
    // 等待编码完成
    await createEncoder()

    // 封装视频
    muxer.finalize()

    // 从 target 获取缓冲区数据
    const webmBuffer = target.buffer

    const blob = new Blob([webmBuffer], { type: 'video/webm' })
    const url = URL.createObjectURL(blob)

    // 下载
    const a = document.createElement('a')
    a.href = url
    a.download = 'output.webm'
    document.body.appendChild(a) // 添加到 DOM
    a.click()
    document.body.removeChild(a) // 清理 DOM

    // 清理 URL
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  } catch (error) {
    console.error('Export failed:', error)
    throw error
  }
}
