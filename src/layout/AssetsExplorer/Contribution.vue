<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { CircleFadingPlus, Flame, LoaderCircle } from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import Upload, { processFiles } from '../../components/Upload'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ACCEPT_MEDIA, type UploadResult } from '@/components/Upload'
import { ref } from 'vue'
import { useEndpoint } from '@/lib/request'
import TooltipX from '@/components/ui/tooltip/TooltipX.vue'
import { TagsInputX } from '@/components/ui/tags-input'
import { toast } from 'vue-sonner'
import { AssetTypeEnum } from '@/endpoints/asset'
import Image from '@/components/Image'

const uploadResult = ref<UploadResult | undefined>(undefined)
const posterUploadResult = ref<UploadResult | undefined>(undefined)
const caption = ref<string | undefined>(undefined)
const tags = ref<string[]>([])
const open = ref(false)

const resetValues = () => {
  uploadResult.value = undefined
  caption.value = undefined
  tags.value = []
}

const { run: generateImageCaption, loading: generating } = useEndpoint(
  'v1/image/captions',
  {
    method: 'POST',
    onSuccess: (data) => {
      caption.value = data.caption
    },
  },
)

const { run: createImageAsset, loading: imageCreating } = useEndpoint(
  'v1/images',
  {
    method: 'POST',
    onSuccess: () => {
      toast.success('成功提交资源')
      open.value = false
    },
  },
)

const { run: createVideoAsset, loading: videoCreating } = useEndpoint(
  'v1/videos',
  {
    method: 'POST',
    onSuccess: () => {
      toast.success('成功提交资源')
      open.value = false
    },
  },
)

const { run: createAudioAsset, loading: audioCreating } = useEndpoint(
  'v1/audios',
  {
    method: 'POST',
    onSuccess: () => {
      toast.success('成功提交资源')
      open.value = false
    },
  },
)

const handleUpload = (_: string, result: UploadResult, file: File) => {
  if (result.type === AssetTypeEnum.VIDEO) {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.src = URL.createObjectURL(file)

    video.addEventListener('loadedmetadata', () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      video.currentTime = 0

      video.addEventListener('seeked', () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        canvas.toBlob((blob) => {
          if (blob) {
            processFiles(
              [new File([blob], 'poster.png', { type: 'image/png' })],
              {},
              (_, __, result) => {
                posterUploadResult.value = result
              },
            )
          }
        }, 'image/png')
      })
    })
  }
  uploadResult.value = result
}

const handleSubmit = () => {
  if (uploadResult.value && caption.value) {
    if (uploadResult.value.type === AssetTypeEnum.IMAGE) {
      createImageAsset({
        key: uploadResult.value.key,
        caption: caption.value,
        tags: tags.value,
      })
    } else if (uploadResult.value.type === AssetTypeEnum.VIDEO) {
      createVideoAsset({
        key: uploadResult.value.key,
        posterKey: posterUploadResult.value!.key,
        caption: caption.value,
        tags: tags.value,
      })
    } else if (uploadResult.value.type === AssetTypeEnum.AUDIO) {
      createAudioAsset({
        key: uploadResult.value.key,
        caption: caption.value,
        tags: tags.value,
      })
    }
  }
}
</script>

<template>
  <TooltipX>
    <Dialog :open="open" @update:open="open = $event">
      <DialogTrigger as-child>
        <Button
          class="bg-alpha-5 text-foreground-1 size-8 text-xs hover:bg-alpha-10"
          @click="resetValues"
        >
          <CircleFadingPlus />
        </Button>
      </DialogTrigger>
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>分享您的资源</DialogTitle>
          <DialogDescription> 让您的资源帮助更多的人 </DialogDescription>
        </DialogHeader>

        <!-- File -->
        <Label>资源</Label>
        <Upload
          v-model="uploadResult"
          :class="uploadResult ? 'w-80' : 'size-40'"
          :accept="ACCEPT_MEDIA"
          @upload="handleUpload"
        />

        <div v-if="posterUploadResult">
          <Label>封面</Label>
          <Image
            :src="posterUploadResult?.url"
            root-class="block"
            class="w-40 mt-3"
          />
        </div>

        <!-- Description -->
        <div class="flex-between">
          <Label>描述</Label>
          <LoaderCircle
            v-if="generating"
            class="float-right size-5 animate-spin"
          />
          <TooltipX
            v-else-if="
              uploadResult && uploadResult.type === AssetTypeEnum.IMAGE
            "
          >
            <Flame
              :loading="imageCreating"
              class="float-right size-5"
              @click="generateImageCaption({ key: uploadResult?.key })"
            />
            <template #content> 生成描述 </template>
          </TooltipX>
        </div>
        <Textarea v-model="caption" rows="5"></Textarea>

        <!-- Tags -->
        <Label>标签</Label>
        <TagsInputX v-model="tags" />

        <DialogFooter>
          <Button
            :disabled="!uploadResult || !caption"
            :loading="imageCreating || videoCreating || audioCreating"
            @click="handleSubmit"
          >
            提交
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <template #content> 贡献 </template>
  </TooltipX>
</template>
