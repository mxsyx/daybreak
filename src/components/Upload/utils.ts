import { encode as encodeWebp } from '@jsquash/webp'
import { getUrl } from '@/lib/request'
import { rgbaToThumbHash } from 'thumbhash'
import { AssetTypeEnum, type AssetType } from '@/endpoints/asset'

// TODO support more file types
export const ACCEPT_IMAGE = 'image/jpeg, image/png, image/webp'
export const ACCEPT_VIDEO = 'video/mp4, video/ogg, video/webm'
export const ACCEPT_AUDIO = 'audio/mpeg, audio/ogg, audio/aac'

// prettier-ignore
export const ACCEPT_OFFICE = 'application/pdf, application/msword, application/vnd.ms-excel, application/vnd.ms-powerpoint, plain/text'
export const ACCEPT_MEDIA = `${ACCEPT_IMAGE}, ${ACCEPT_VIDEO}, ${ACCEPT_AUDIO}`
export const ACCEPT_ALL = `${ACCEPT_IMAGE},  ${ACCEPT_VIDEO}, ${ACCEPT_OFFICE}`

export interface UploadResult {
  id: string
  key: string
  type: AssetType
  metadata: { size: string } & {
    type: 'image/webp'
    width: number
    height: number
    thumbhash: string
  }
  url: string
}

export interface UploadTarget {
  file: File
  type: AssetType
  img?: HTMLImageElement
  buffer?: ArrayBuffer
  width?: number
  height?: number
  duration?: number
}

export interface UploadProps {
  maxSize?: number
  accept?: string
  multiple?: boolean
  maxCount?: number
  class?: string
  placeholder?: string
  width?: number
  height?: number
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  disabled?: boolean
  formDisabled?: boolean
  removeable?: boolean
}

export type UploadEmit = (
  evt: 'upload',
  url: string,
  result: UploadResult,
  file: File,
) => void

/**
 * Processes an array of files and resolves metadata information for images, videos, and audio files.
 *
 * @param files - An array of File objects to be read and processed.
 * @returns A promise that resolves to an array of UploadTarget objects, each containing metadata
 *          such as dimensions for images and videos, and duration for videos and audio files.
 *
 * The function distinguishes between image, video, and audio files based on their MIME types. For images,
 * it creates an HTMLImageElement to obtain natural dimensions. For videos and audio, it uses HTMLVideoElement
 * and HTMLAudioElement respectively to fetch metadata like dimensions and duration.
 */
const readFiles = (files: File[]) => {
  return files.map(
    (file) =>
      new Promise((resolve) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader()
          reader.onload = () => {
            const img = document.createElement('img')
            const onload = () => {
              resolve({
                file,
                type: AssetTypeEnum.IMAGE,
                img,
                width: img.naturalWidth,
                height: img.naturalHeight,
              })
            }
            img.onload = onload
            img.src = reader.result as string
            if (img.complete) {
              onload()
            }
          }
          reader.readAsDataURL(file)
        } else if (file.type.startsWith('video/')) {
          const video = document.createElement('video')
          video.preload = 'metadata'
          video.src = URL.createObjectURL(file)
          video.addEventListener('loadedmetadata', () => {
            resolve({
              file,
              type: AssetTypeEnum.VIDEO,
              width: video.videoWidth,
              height: video.videoHeight,
              duration: video.duration,
            })
          })
        } else if (file.type.startsWith('audio/')) {
          const audio = document.createElement('audio')
          audio.preload = 'metadata'
          audio.src = URL.createObjectURL(file)
          audio.addEventListener('loadedmetadata', () => {
            resolve({
              file,
              type: AssetTypeEnum.AUDIO,
              duration: audio.duration,
            })
          })
        }
      }),
  ) as Promise<UploadTarget>[]
}

/**
 * Checks if the given files fulfill the minimum and maximum width and height constraints.
 *
 * @param targets - An array of UploadTarget objects to be checked.
 * @param props - The UploadProps object containing the constraints.
 * @returns A promise that resolves to an array of boolean values indicating whether the constraints are fulfilled.
 *          If a file fails to fulfill the constraints, the promise is rejected with an error message.
 */
const checkFiles = (targets: UploadTarget[], props: UploadProps) => {
  return targets.map(
    (target) =>
      new Promise((resolve, reject) => {
        if (target.img) {
          const messages: string[] = []
          if (target.img.width < props.minWidth!) {
            messages.push(
              `The width of ${target.file.name} must be greater than ${props.minWidth} pixels`,
            )
          } else if (target.img.height < props.minHeight!) {
            messages.push(
              `The height of ${target.file.name} must be greater than ${props.minHeight} pixels`,
            )
          } else if (target.img.width > props.maxWidth!) {
            messages.push(
              `The width of ${target.file.name} must be less than ${props.maxWidth} pixels`,
            )
          } else if (target.img.height > props.maxHeight!) {
            messages.push(
              `The height of ${target.file.name} must be less than ${props.maxHeight} pixels`,
            )
          }
          if (messages.length > 0) {
            return reject(messages.join('; '))
          }
        }
        resolve(true)
      }),
  ) as Promise<boolean>[]
}

/**
 * Compresses the images in the provided UploadTarget array using the WebP format.
 *
 * @param targets - An array of UploadTarget objects representing the images to be compressed.
 * @param props - The UploadProps object containing constraints such as maximum file size.
 * @returns An array of promises that resolve to the compressed image buffers.
 *          If compression fails due to exceeding the maximum size, the promise is rejected with an error message.
 *
 * The function draws each image onto a canvas, extracts the raw image data, and encodes it into WebP format.
 * It checks if the compressed image size is within the specified maxSize; otherwise, it rejects the promise.
 */
const compressImages = (targets: UploadTarget[], props: UploadProps) => {
  return targets.map(
    (target) =>
      new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas')
        canvas.width = target.width!
        canvas.height = target.height!
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(target.img!, 0, 0)
        const rawImageData = ctx.getImageData(
          0,
          0,
          target.width!,
          target.height!,
        )
        encodeWebp(rawImageData)
          .then((buffer) => {
            if (buffer.byteLength > props.maxSize!) {
              return reject('Image compression failed')
            }

            target.buffer = buffer
            resolve(buffer)
          })
          .catch(reject)
      }),
  )
}

/**
 * Encodes a thumbnail hash for a given image.
 *
 * @param target - The UploadTarget object containing the image.
 * @returns A string representing the thumbnail hash, encoded in Base64.
 *
 * The function creates a canvas, draws the image on it, and extracts the raw image data.
 * It then converts the raw image data to a thumbnail hash using rgbaToThumbHash.
 * The resulting thumbnail hash is encoded in Base64 and returned.
 */
const encodeThumbhash = (target: UploadTarget) => {
  const { img, width, height } = target
  if (!img || !width || !height) {
    return
  }

  const size = Math.max(width, height)
  const w = (img.width = Math.round((100 * width) / size))
  const h = (img.height = Math.round((100 * height) / size))
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  canvas.width = w
  canvas.height = h
  ctx.drawImage(img, 0, 0, w, h)
  const pixels = ctx.getImageData(0, 0, w, h)

  const thumb = rgbaToThumbHash(w, h, pixels.data)
  return btoa(String.fromCharCode(...thumb)).replace(/=+$/, '')
}

/**
 * Uploads files to the server and returns an array of promises that resolve to an
 * array of UploadResult objects, each containing the uploaded file's URL and other
 * metadata.
 *
 * @param targets - An array of UploadTarget objects containing the files to be
 * uploaded.
 * @param emit - An UploadEmit object for emitting 'upload' events.
 *
 * The function maps over the targets array and for each target, creates a new
 * Promise that resolves to an UploadResult object. The Promise is resolved once
 * the file has been uploaded to the server and the response has been received.
 *
 * The function also emits an 'upload' event for each file that is uploaded,
 * passing the file's URL and other metadata as arguments.
 */
const uploadFiles = (targets: UploadTarget[], emit: UploadEmit) => {
  return targets.map(
    (target) =>
      new Promise((resolve, reject) => {
        const formData = new FormData()

        if (target.type === AssetTypeEnum.IMAGE) {
          const blob = new Blob([target.buffer!], { type: 'image/webp' })
          formData.append('file', blob)

          const thumbhash = encodeThumbhash(target)
          if (thumbhash) {
            formData.append('thumbhash', thumbhash)
          }
          formData.append('width', String(target.width))
          formData.append('height', String(target.height))
        } else if (target.type === AssetTypeEnum.VIDEO) {
          const blob = new Blob([target.file], { type: 'video/mp4' })
          formData.append('file', blob)

          formData.append('width', '1920')
          formData.append('height', '1080')
          formData.append('duration', '200')
        } else if (target.type === AssetTypeEnum.AUDIO) {
          const blob = new Blob([target.file], { type: 'audio/mpeg' })
          formData.append('file', blob)

          formData.append('duration', '200')
        } else {
          formData.append('file', target.file)
        }

        fetch(getUrl('v1/files'), {
          method: 'POST',
          body: formData,
        })
          .then(async (response) => {
            const result = (await response.json()) as UploadResult
            const url = URL.createObjectURL(target.file)
            result.url = url
            emit('upload', url, result, target.file)
            resolve(result)
          })
          .catch((error) => {
            reject(error.messages)
          })
      }),
  ) as Promise<UploadResult>[]
}

/**
 * Process an array of File objects and upload them to the server.
 *
 * @param files - An array of File objects to be uploaded.
 * @param props - An UploadProps object containing the maximum size, accepted
 * file types, and other metadata.
 * @param emit - An UploadEmit object for emitting 'upload' events.
 *
 * The function processes the files in three steps:
 * 1. It reads the files and creates a new UploadTarget object for each file.
 * 2. It checks the files against the props and removes any files that do not
 * meet the requirements.
 * 3. It compresses any images in the array and uploads all files to the
 * server.
 *
 * The function returns a Promise that resolves to an array of UploadResult
 * objects, each containing the URL of the uploaded file and other metadata.
 *
 * The function also emits an 'upload' event for each file that is uploaded,
 * passing the file's URL and other metadata as arguments.
 */
export const processFiles = async (
  files: File[],
  props: UploadProps,
  emit: UploadEmit,
) => {
  const targets = await Promise.all(readFiles(Array.from(files)))
  await Promise.all(checkFiles(targets, props))
  await Promise.all(
    compressImages(
      targets.filter((target) => target.type === AssetTypeEnum.IMAGE),
      props,
    ),
  )
  // await Promise.all(
  //   encodeVideos(
  //     targets.filter((target) => target.type === AssetTypeEnum.VIDEO),
  //   ),
  // )

  const promises = uploadFiles(targets, emit)
  const values: UploadResult[] = []
  promises.forEach((promise) => {
    promise.then((value) => {
      values.push(value)
    })
  })
  await Promise.all(promises)

  return values
}
