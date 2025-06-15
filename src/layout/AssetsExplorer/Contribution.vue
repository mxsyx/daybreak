<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { CircleFadingPlus } from 'lucide-vue-next'
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import Upload from '../../components/Upload'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { UploadResult } from '@/components/Upload/Upload.vue'
import { ref } from 'vue'
import Image from '@/components/Image/Image.vue'

const uploadResult = ref<UploadResult | undefined>(undefined)
const assetUrl = ref<string>('')

const handleUpload = (url: string, result: UploadResult) => {
  assetUrl.value = url
  uploadResult.value = result
}
</script>

<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger>
        <Dialog>
          <DialogTrigger as-child>
            <Button
              class="bg-alpha-5 text-foreground-1 size-8 text-xs hover:bg-alpha-10"
            >
              <CircleFadingPlus />
            </Button>
          </DialogTrigger>
          <DialogContent class="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>分享您的资源</DialogTitle>
              <DialogDescription> 让您的资源帮助更多的人 </DialogDescription>
            </DialogHeader>
            <Image
              src="/image_93cd1e72-61a4-48bf-83a1-7b44df1f873d.webp?thumbhash=1NYFDIIul3hvaoaHh7yzgCsI6Q&w=1920&h=1080"
              width="384"
              height="216"
            />
            <Label>资源</Label>
            <Upload v-model="uploadResult" />
            <Label>描述</Label>
            <Textarea />
            <DialogFooter>
              <Button type="submit"> 提交 </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TooltipTrigger>
      <TooltipContent> 贡献 </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
