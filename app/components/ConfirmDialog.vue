<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="emit('cancel')" />

        <!-- Dialog -->
        <div class="relative z-10 w-full max-w-sm mx-4 bg-card rounded-lg shadow-xl border border-border">
          <!-- Header -->
          <div class="flex items-start gap-4 p-6">
            <div class="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertTriangle class="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h2 class="text-base font-semibold text-card-foreground">{{ title }}</h2>
              <p class="text-sm text-muted-foreground mt-1">{{ description }}</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex justify-end gap-3 px-6 pb-6">
            <button
              @click="emit('cancel')"
              :disabled="loading"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              @click="emit('confirm')"
              :disabled="loading"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 px-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div v-if="loading" class="h-3.5 w-3.5 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
              {{ loading ? 'Menghapus...' : 'Hapus' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'

defineProps<{
  isOpen: boolean
  title: string
  description: string
  loading?: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>