<!-- components/DataTable/DataTable.vue -->
<template>
  <div class="w-full overflow-hidden">
    <!-- Desktop Table -->
    <div class="hidden md:block overflow-x-auto border rounded-lg">
      <table class="w-full caption-bottom text-sm">
        <thead class="border-b">
          <tr class="hover:bg-muted/50">
            <th
              v-for="column in columns"
              :key="column.key"
              class="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
              :class="[column.class]"
            >
              <div class="flex items-center gap-2">
                {{ column.label }}
                <button
                  v-if="column.sortable"
                  @click="() => handleSort(column.key)"
                  class="hover:text-foreground transition-colors"
                >
                  <ArrowUpDownIcon class="h-4 w-4" />
                </button>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, i) in sortedData"
            :key="row.id"
            class="border-b transition-colors hover:bg-muted/50"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="p-4 align-middle"
              :class="[column.class]"
            >
              <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
                <div v-if="column.key === 'status'">
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    :class="getStatusBadgeClass(row.status)"
                  >
                    {{ row.status }}
                  </span>
                </div>
                <div v-else-if="column.key === 'kategori'">
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    :class="getCategoryBadgeClass(row.kategori)"
                  >
                    {{ row.kategori }}
                  </span>
                </div>
                <div v-else>
                  {{ row[column.key] }}
                </div>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Card View -->
    <div class="md:hidden space-y-3">
      <div
        v-for="row in sortedData"
        :key="row.id"
        class="border rounded-lg p-4 bg-card hover:bg-accent/5 transition-colors"
      >
        <div class="grid grid-cols-2 gap-3">
          <template v-for="column in mobileColumns" :key="column.key">
            <div class="text-sm text-muted-foreground">{{ column.label }}:</div>
            <div class="font-medium">
              <slot v-if="column.key === 'status'" :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  :class="getStatusBadgeClass(row.status)"
                >
                  {{ row.status }}
                </span>
              </slot>
              <slot v-else-if="column.key === 'kategori'" :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  :class="getCategoryBadgeClass(row.kategori)"
                >
                  {{ row.kategori }}
                </span>
              </slot>
              <slot v-else :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
                {{ row[column.key] }}
              </slot>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowUpDownIcon } from 'lucide-vue-next'

interface Column {
  key: string
  label: string
  sortable?: boolean
  class?: string
}

interface Props {
  columns: Column[]
  data: any[]
  mobileColumns?: Column[]
}

const props = withDefaults(defineProps<Props>(), {
  mobileColumns: () => []
})

const sortKey = ref<string>('')
const sortDirection = ref<'asc' | 'desc'>('asc')

const handleSort = (key: string) => {
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDirection.value = 'asc'
  }
}

const sortedData = computed(() => {
  if (!sortKey.value) return props.data

  return [...props.data].sort((a, b) => {
    const aValue = a[sortKey.value]
    const bValue = b[sortKey.value]

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection.value === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }

    return sortDirection.value === 'asc' 
      ? (aValue > bValue ? 1 : -1)
      : (bValue > aValue ? 1 : -1)
  })
})

const getStatusBadgeClass = (status: string) => {
  return status === 'Aman'
    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
}

const getCategoryBadgeClass = (kategori: string) => {
  const classes: Record<string, string> = {
    'ATK': 'bg-primary/10 text-primary hover:bg-primary/20',
    'Bahan Praktik': 'bg-accent/10 text-accent-foreground hover:bg-accent/20',
    'Perlengkapan Kelas': 'bg-secondary/10 text-secondary-foreground hover:bg-secondary/20',
    'Kebersihan': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
  }
  return classes[kategori] || 'bg-muted text-muted-foreground'
}
</script>