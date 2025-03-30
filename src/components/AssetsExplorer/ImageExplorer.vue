<script setup lang="ts">
const handleDragStart = (e: DragEvent) => {
  e.dataTransfer!.setData(
    'application/json',
    JSON.stringify({
      type: 'image',
      src: 'https://pub-41194815121a4efe96145ae898daa4ad.r2.dev/01tx.jpg',
    })
  )
}
</script>

<template>
  <div class="flex flex-wrap gap-4">
    <!-- <div
      class="p-1 rounded-xs border border-dashed border-transparent hover:border-white cursor-pointer"
      draggable
      @dragstart="handleDragStart"
    >
      <img
        src="https://pub-41194815121a4efe96145ae898daa4ad.r2.dev/01tx.jpg"
        width="200"
        height="200"
      />
    </div> -->
  </div>
</template>
