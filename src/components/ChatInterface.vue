<script setup lang="ts">
import { ref } from 'vue';

import ChatMessage from '@/components/ChatMessage.vue';
import Spinner from '@/components/Spinner.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  content: string;
  role: 'user' | 'assistant';
}

const messages = ref<Message[]>([]);
const isLoading = ref(false);
const isStreaming = ref(false);
const inputMessage = ref('');

async function onSubmit() {
  if (!inputMessage.value.trim()) return;

  const userMessage: Message = { content: inputMessage.value, role: 'user' };
  messages.value.push(userMessage);
  isLoading.value = true;
  inputMessage.value = '';

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messages.value }),
    });

    if (!res.ok) throw new Error('Failed to fetch response');
    const assistantMessageIndex = messages.value.length;
    messages.value.push({ content: '', role: 'assistant' });

    if (!(res.body instanceof ReadableStream)) {
      throw new Error('Response is not a stream');
    }
    isLoading.value = false;
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      messages.value[assistantMessageIndex].content += chunk;
    }
  } catch (error) {
    console.error('Error in chat:', error);
    messages.value.push({ content: 'An error occurred. Please try again.', role: 'assistant' });
  } finally {
    isStreaming.value = false;
  }
}
</script>

<template>
  <div class="flex flex-col">
    <ScrollArea class="flex-grow p-4">
      <div v-for="(message, index) in messages" :key="index" class="mb-4">
        <ChatMessage :content="message.content" :role="message.role" />
      </div>
      <div v-if="isLoading" class="flex items-center justify-center">
        <Spinner />
      </div>
    </ScrollArea>
    <form class="border-t p-4" @submit.prevent="onSubmit">
      <div class="flex space-x-2">
        <Input
          v-model="inputMessage"
          placeholder="Type your message..."
          :disabled="isLoading"
          class="flex-grow"
          required
        />
        <Button type="submit" :disabled="isLoading || isStreaming" size="icon">
          <span class="sr-only"> {{ isLoading ? 'Sending...' : 'Send' }}</span>
          <span class="i-lucide-send-horizontal size-6" />
        </Button>
      </div>
    </form>
  </div>
</template>
