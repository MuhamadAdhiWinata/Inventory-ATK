<template>
  <teleport to="body">
    <div class="fixed top-0 right-0 z-50 w-full max-w-md p-4 space-y-4 pointer-events-none">
      <transition-group name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto"
        >
          <div
            :class="[
              'flex items-start gap-3 rounded-lg border p-4 shadow-lg transition-all',
              toast.variant === 'destructive'
                ? 'border-destructive bg-destructive text-destructive-foreground'
                : toast.variant === 'success'
                ? 'border-success/30 bg-success/10 text-foreground'
                : 'border-border bg-card text-card-foreground'
            ]"
          >
            <!-- Icon -->
            <div class="flex-shrink-0 mt-0.5">
              <CheckCircle2
                v-if="toast.variant === 'success'"
                class="h-5 w-5 text-success"
              />
              <CheckCircle2
                v-else-if="toast.variant === 'default'"
                class="h-5 w-5 text-primary"
              />
              <AlertCircle
                v-else-if="toast.variant === 'destructive'"
                class="h-5 w-5 text-destructive-foreground"
              />
              <Info v-else class="h-5 w-5 text-muted-foreground" />
            </div>

            <!-- Content -->
            <div class="flex-1 space-y-0.5">
              <div v-if="toast.title" class="font-semibold text-sm leading-snug">
                {{ toast.title }}
              </div>
              <div
                v-if="toast.description"
                class="text-sm"
                :class="toast.variant === 'destructive'
                  ? 'text-destructive-foreground/80'
                  : 'text-muted-foreground'"
              >
                {{ toast.description }}
              </div>
            </div>

            <!-- Close Button -->
            <button
              @click="dismiss(toast.id)"
              class="flex-shrink-0 rounded-md p-0.5 opacity-60 hover:opacity-100 transition-opacity"
              :class="toast.variant === 'destructive'
                ? 'text-destructive-foreground hover:bg-destructive-foreground/10'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'"
            >
              <X class="h-4 w-4" />
            </button>
          </div>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { useToast } from '@/hooks/use-toast'
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-vue-next'

const { toasts, dismiss } = useToast()
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.3s ease-out;
}
.toast-leave-active {
  transition: all 0.2s ease-in;
}
.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
.toast-move {
  transition: transform 0.3s ease;
}
</style>