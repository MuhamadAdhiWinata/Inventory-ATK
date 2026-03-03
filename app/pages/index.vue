<!-- app/pages/index.vue -->
<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth']
})
</script>

<template>
  <div class="p-4 md:p-6">
    <h1 class="text-2xl font-bold">Dashboard</h1>
    <p class="text-muted-foreground text-sm mt-1">Selamat datang di Inventory ATK.</p>
  </div>
</template>