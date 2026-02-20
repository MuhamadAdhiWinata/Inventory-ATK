<template>
  <SidebarProvider>
    <AppSidebar />
    <main class="flex-1 flex flex-col min-w-0">
      <AppNavbar />
      <div class="flex-1 bg-background">
        <slot />
      </div>
    </main>
  </SidebarProvider>
</template>

<script setup lang="ts">
import { SidebarProvider } from '@/components/ui/sidebar'
import AppSidebar from '@/components/AppSidebar.vue'
import AppNavbar from '@/components/AppNavbar.vue'
</script>
