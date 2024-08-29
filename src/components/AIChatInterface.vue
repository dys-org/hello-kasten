<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Message {
  content: string
  role: 'user' | 'assistant'
}

const messages = ref<Message[]>([])
const isLoading = ref(false)
const inputMessage = ref('')

async function onSubmit() {
  if (!inputMessage.value.trim()) return

  const userMessage: Message = { content: inputMessage.value, role: 'user' }
  messages.value.push(userMessage)
  isLoading.value = true

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messages.value
      })
    })

    if (!response.ok) throw new Error('Failed to fetch response')

    const data = await response.json()
    const assistantMessage: Message = {
      content: data.response,
      role: 'assistant'
    }
    messages.value.push(assistantMessage)
  } catch (error) {
    console.error('Error in chat:', error)
    messages.value.push({
      content: 'An error occurred. Please try again.',
      role: 'assistant'
    })
  } finally {
    isLoading.value = false
    inputMessage.value = ''
  }
}

const formattedMessages = computed(() =>
  messages.value.map((msg) => ({
    ...msg,
    content: msg.content.replace(/\n/g, '<br>')
  }))
)
</script>

<template>
  <div class="flex flex-col">
    <ScrollArea class="flex-grow p-4">
      <div v-for="(message, index) in formattedMessages" :key="index" class="mb-4">
        <div
          :class="[
            'p-2 rounded-lg max-w-[80%] border-border border shadow-md',
            message.role === 'user' ? 'bg-primary ml-auto text-primary-foreground' : 'bg-card'
          ]"
        >
          <p v-html="message.content"></p>
        </div>
      </div>
    </ScrollArea>
    <form @submit.prevent="onSubmit" class="p-4 border-t">
      <div class="flex space-x-2">
        <Input
          v-model="inputMessage"
          placeholder="Type your message..."
          :disabled="isLoading"
          class="flex-grow"
          required
        />
        <Button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Sending...' : 'Send' }}
        </Button>
      </div>
    </form>
  </div>
</template>
