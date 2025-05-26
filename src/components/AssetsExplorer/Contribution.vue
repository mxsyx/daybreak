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
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Upload from '../Upload'
import { z } from 'zod'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'

const formSchema = toTypedSchema(
  z.object({
    username: z.string(),
  })
)

const form = useForm({
  validationSchema: formSchema,
})

const onSubmit = form.handleSubmit((values) => {
  console.log('Form submitted!', values)
})
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
            <form>
              <FormField name="username" v-slot="{ componentField }">
                <FormItem>
                  <FormLabel>资源</FormLabel>
                  <FormControl>
                    <Upload v-bind="componentField" />
                  </FormControl>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              </FormField>
              <FormField name="username" v-slot="{ componentField }">
                <FormItem>
                  <FormLabel>描述</FormLabel>
                  <FormControl>
                    <Textarea v-bind="componentField" />
                  </FormControl>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              </FormField>
            </form>
            <DialogFooter>
              <Button type="submit" @click="onSubmit"> 提交 </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TooltipTrigger>
      <TooltipContent> 贡献 </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
