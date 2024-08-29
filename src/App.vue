<script setup lang="ts">
import AIChatInterface from '@/components/AIChatInterface.vue'
import DarkModeToggle from '@/components/DarkModeToggle.vue'
</script>

<template>
  <div class="container p-4">
    <header class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Hello Kasten</h1>
      <DarkModeToggle />
    </header>
    <AIChatInterface class="h-[calc(100vh_-_140px)] max-w-screen-md mx-auto" />
  </div>
</template>
