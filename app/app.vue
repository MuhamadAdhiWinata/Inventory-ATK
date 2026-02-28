<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <Toaster />

  <div
    v-if="development"
    class="fixed bottom-6 -left-9 z-50 pointer-events-none"
  >
    <div class="bg-red-600 text-white px-10 py-1.5 transform rotate-45 font-bold text-xs uppercase tracking-wider shadow-lg">
      Development
    </div>
  </div>
</template>

<script setup lang="ts">
import Toaster from './components/ui/Toaster.vue';

const development = import.meta.env.DEV
</script>