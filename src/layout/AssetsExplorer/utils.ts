import { CDN_URL } from '@/lib/constants'

export interface TransferData {
  type: AssetType
  src: string
  pointerPercentX: number
  pointerPercentY: number
}

export function handleDragStart(e: DragEvent, type: AssetType, src: string) {
  const { left, top, width, height } = (
    e.target as HTMLElement
  ).getBoundingClientRect()

  e.dataTransfer!.setData(
    'application/json',
    JSON.stringify({
      type,
      src: `${CDN_URL}${src}`,
      pointerPercentX: (e.clientX - left) / width,
      pointerPercentY: (e.clientY - top) / height,
    }),
  )
}
