<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { CircleFadingPlus, Flame, Loader, LoaderCircle } from 'lucide-vue-next'
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
import { useEndpoint } from '@/lib/request'

const uploadResult = ref<UploadResult | undefined>(undefined)
const caption = ref<string | undefined>(undefined)
const assetUrl = ref<string>('')

const { run: generateImageCaption, loading } = useEndpoint(
  'v1/image/captions',
  {
    method: 'POST',
    onSuccess: (data) => {
      caption.value = data.caption
    },
  },
)
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
            <Label>资源</Label>
            <Upload v-model="uploadResult" class="size-40" />
            <div class="flex-between">
              <Label>描述</Label>
              <LoaderCircle
                v-if="loading"
                class="float-right size-5 animate-spin"
              />
              <Flame
                v-else-if="uploadResult"
                :loading="loading"
                class="float-right size-5"
                @click="generateImageCaption({ key: uploadResult?.key })"
              />
            </div>
            <Textarea v-model="caption" rows="5"></Textarea>
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
