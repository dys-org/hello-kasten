<script setup lang="ts">
import ChatInterface from '@/components/ChatInterface.vue';
import DarkModeToggle from '@/components/DarkModeToggle.vue';
</script>

<template>
  <div class="container p-4">
    <header class="mb-4 flex items-center justify-between">
      <h1 class="text-2xl font-bold">Hello Kasten</h1>
      <DarkModeToggle />
    </header>
    <ChatInterface class="mx-auto h-[calc(100vh_-_100px)] max-w-screen-md" />
  </div>
</template>
