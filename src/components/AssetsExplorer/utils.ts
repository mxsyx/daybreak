export function handleDragStart(e: DragEvent, type: string, src: string) {
  e.dataTransfer!.setData('application/json', JSON.stringify({ type, src }))
}
