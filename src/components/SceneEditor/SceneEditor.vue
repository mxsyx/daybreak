<script setup lang="ts">
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'
</script>

<template>
  <Tabs
    default-value="account"
    class="bg-surface-2 rounded-xl border-[1px] border-stroke overflow-auto"
    as="aside"
  >
    <div class="p-4 sticky top-0 bg-surface-2 w-full justify-start">
      <TabsList>
        <TabsTrigger value="objects">对象</TabsTrigger>
        <TabsTrigger value="background">背景</TabsTrigger>
        <TabsTrigger value="sounds"> 音效 </TabsTrigger>
      </TabsList>
    </div>
  </Tabs>
</template>
