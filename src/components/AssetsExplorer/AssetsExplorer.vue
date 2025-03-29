<script setup lang="ts">
import { Button } from "@/components/ui/button";
import ImageExplorer from "./ImageExplorer.vue";
import LayoutExplorer from "./LayoutExplorer.vue";
</script>

<template>
  <div>
    <div class="flex gap-2">
      <Button>布局</Button>
      <Button>背景</Button>
      <Button>音乐</Button>
      <Button>音效</Button>
      <Button>图片</Button>
      <Button>贴纸</Button>
      <Button>视频</Button>
    </div>
    <LayoutExplorer />
    <ImageExplorer />
  </div>
</template>
