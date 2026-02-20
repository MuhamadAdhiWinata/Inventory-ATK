<!-- components/DataTable/TablePagination.vue - FULLY FIXED -->
<template>
  <div class="flex items-center justify-between px-2 py-4">
    <div class="text-sm text-muted-foreground">
      Menampilkan {{ startItem }}-{{ endItem }} dari {{ totalItems }} item
    </div>
    <div class="flex items-center space-x-2">
      <button
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9"
      >
        <ChevronLeftIcon class="h-4 w-4" />
      </button>
      
      <div class="flex items-center space-x-1">
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="goToPage(page)"
          class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9"
          :class="{
            'bg-primary text-primary-foreground hover:bg-primary/90': currentPage === page
          }"
        >
          {{ page }}
        </button>
        <span v-if="showEllipsis" class="px-2 text-muted-foreground">...</span>
      </div>
      
      <button
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9"
      >
        <ChevronRightIcon class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next'

interface Props {
  currentPage: number
  totalItems: number
  itemsPerPage: number
  maxVisiblePages?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxVisiblePages: 5
})

const emit = defineEmits<{
  'page-change': [page: number]
}>()

const totalPages = computed(() => {
  if (props.totalItems === 0 || props.itemsPerPage === 0) return 1
  return Math.ceil(props.totalItems / props.itemsPerPage)
})

const startItem = computed(() => {
  if (props.totalItems === 0) return 0
  return ((props.currentPage - 1) * props.itemsPerPage) + 1
})

const endItem = computed(() => {
  if (props.totalItems === 0) return 0
  return Math.min(props.currentPage * props.itemsPerPage, props.totalItems)
})

const visiblePages = computed(() => {
  const pages: number[] = []
  
  if (totalPages.value <= 0) return pages
  
  const halfVisible = Math.floor(props.maxVisiblePages / 2)
  
  let start = Math.max(1, props.currentPage - halfVisible)
  let end = Math.min(totalPages.value, start + props.maxVisiblePages - 1)
  
  if (end - start + 1 < props.maxVisiblePages) {
    start = Math.max(1, end - props.maxVisiblePages + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

const showEllipsis = computed(() => {
  const lastVisiblePage = visiblePages.value?.[visiblePages.value.length - 1]
  
  if (!lastVisiblePage) return false
  
  return totalPages.value > props.maxVisiblePages && lastVisiblePage < totalPages.value
})

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    emit('page-change', page)
  }
}
</script>