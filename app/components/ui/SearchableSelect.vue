<template>
  <div class="relative" ref="containerRef">
    <!-- Input trigger -->
    <div
      @click="toggleDropdown"
      class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors cursor-pointer flex items-center justify-between gap-2"
      :class="[
        isOpen ? 'ring-1 ring-ring border-ring' : 'hover:border-ring/50',
        hasError ? 'border-destructive' : '',
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      ]"
    >
      <!-- Selected label atau placeholder -->
      <span :class="selectedLabel ? 'text-foreground' : 'text-muted-foreground'" class="truncate flex-1">
        {{ selectedLabel || placeholder }}
      </span>
      <!-- Icons -->
      <div class="flex items-center gap-1 shrink-0">
        <button
          v-if="modelValue && !disabled"
          type="button"
          @click.stop="clearSelection"
          class="rounded-sm p-0.5 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
        >
          <XIcon class="h-3.5 w-3.5" />
        </button>
        <ChevronDownIcon
          class="h-4 w-4 text-muted-foreground transition-transform duration-200"
          :class="{ 'rotate-180': isOpen }"
        />
      </div>
    </div>

    <!-- Dropdown -->
    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="dropdownRef"
        :style="dropdownStyle"
        class="fixed z-[9999] bg-popover border border-border rounded-md shadow-lg overflow-hidden"
      >
        <!-- Search input -->
        <div class="p-2 border-b border-border">
          <div class="relative">
            <SearchIcon class="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              ref="searchInputRef"
              v-model="query"
              type="text"
              :placeholder="searchPlaceholder"
              class="w-full h-8 rounded-md border border-input bg-background pl-8 pr-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              @keydown.esc="closeDropdown"
              @keydown.enter.prevent="selectHighlighted"
              @keydown.arrow-down.prevent="moveHighlight(1)"
              @keydown.arrow-up.prevent="moveHighlight(-1)"
              @click.stop
            />
          </div>
        </div>

        <!-- Options list -->
        <div ref="listRef" class="overflow-y-auto" style="max-height: 240px">
          <div v-if="filteredOptions.length === 0" class="px-3 py-6 text-center text-sm text-muted-foreground">
            <SearchIcon class="h-5 w-5 mx-auto mb-2 opacity-40" />
            Tidak ada hasil untuk "<span class="font-medium">{{ query }}</span>"
          </div>

          <button
            v-for="(option, index) in filteredOptions"
            :key="option.value"
            type="button"
            @click="selectOption(option)"
            @mouseenter="highlightedIndex = index"
            class="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors"
            :class="[
              highlightedIndex === index ? 'bg-accent text-accent-foreground' : 'hover:bg-muted/50',
              option.value === modelValue ? 'font-medium' : ''
            ]"
          >
            <!-- Check icon untuk selected -->
            <CheckIcon
              class="h-3.5 w-3.5 shrink-0 transition-opacity"
              :class="option.value === modelValue ? 'opacity-100 text-primary' : 'opacity-0'"
            />
            <div class="flex-1 min-w-0">
              <div class="truncate">{{ option.label }}</div>
              <div v-if="option.sublabel" class="text-xs text-muted-foreground truncate">{{ option.sublabel }}</div>
            </div>
            <!-- Badge opsional -->
            <span v-if="option.badge" class="shrink-0 text-xs px-1.5 py-0.5 rounded-full"
              :class="option.badgeClass ?? 'bg-muted text-muted-foreground'">
              {{ option.badge }}
            </span>
          </button>
        </div>

        <!-- Count info -->
        <div v-if="options.length > 8" class="px-3 py-1.5 border-t border-border bg-muted/30">
          <p class="text-xs text-muted-foreground">
            {{ filteredOptions.length }} dari {{ options.length }} item
          </p>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { XIcon, ChevronDownIcon, SearchIcon, CheckIcon } from 'lucide-vue-next'

export interface SelectOption {
  value: number | string
  label: string
  sublabel?: string
  badge?: string
  badgeClass?: string
}

interface Props {
  modelValue: number | string | null
  options: SelectOption[]
  placeholder?: string
  searchPlaceholder?: string
  hasError?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Pilih...',
  searchPlaceholder: 'Cari...',
  hasError: false,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: number | string | null]
  'change': [value: number | string | null]
}>()

const isOpen = ref(false)
const query = ref('')
const highlightedIndex = ref(0)
const containerRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)
const listRef = ref<HTMLElement | null>(null)
const dropdownStyle = ref<Record<string, string>>({})

const selectedLabel = computed(() => {
  if (!props.modelValue) return ''
  const found = props.options.find(o => o.value === props.modelValue)
  return found?.label ?? ''
})

const filteredOptions = computed(() => {
  if (!query.value.trim()) return props.options
  const q = query.value.toLowerCase()
  return props.options.filter(o =>
    o.label.toLowerCase().includes(q) ||
    o.sublabel?.toLowerCase().includes(q)
  )
})

function updateDropdownPosition() {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top
  const dropdownH = 320

  const showAbove = spaceBelow < dropdownH && spaceAbove > spaceBelow

  dropdownStyle.value = {
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    ...(showAbove
      ? { bottom: `${window.innerHeight - rect.top}px` }
      : { top: `${rect.bottom + 4}px` }
    )
  }
}

function toggleDropdown() {
  if (props.disabled) return
  if (isOpen.value) {
    closeDropdown()
  } else {
    openDropdown()
  }
}

function openDropdown() {
  updateDropdownPosition()
  isOpen.value = true
  query.value = ''
  highlightedIndex.value = props.options.findIndex(o => o.value === props.modelValue) || 0
  nextTick(() => searchInputRef.value?.focus())
}

function closeDropdown() {
  isOpen.value = false
  query.value = ''
}

function clearSelection() {
  emit('update:modelValue', null)
  emit('change', null)
}

function selectOption(option: SelectOption) {
  emit('update:modelValue', option.value)
  emit('change', option.value)
  closeDropdown()
}

function selectHighlighted() {
  const option = filteredOptions.value[highlightedIndex.value]
  if (option) selectOption(option)
}

function moveHighlight(dir: 1 | -1) {
  const max = filteredOptions.value.length - 1
  highlightedIndex.value = Math.max(0, Math.min(max, highlightedIndex.value + dir))
  // Auto scroll
  nextTick(() => {
    const el = listRef.value?.children[highlightedIndex.value] as HTMLElement
    el?.scrollIntoView({ block: 'nearest' })
  })
}

// Reset highlight saat filter berubah
watch(filteredOptions, () => { highlightedIndex.value = 0 })

// Klik di luar = tutup
function handleClickOutside(e: MouseEvent) {
  if (!isOpen.value) return
  const target = e.target as Node
  if (!containerRef.value?.contains(target) && !dropdownRef.value?.contains(target)) {
    closeDropdown()
  }
}

// Reposition saat scroll/resize
function handleScroll() {
  if (isOpen.value) updateDropdownPosition()
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  window.addEventListener('scroll', handleScroll, true)
  window.addEventListener('resize', handleScroll)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  window.removeEventListener('scroll', handleScroll, true)
  window.removeEventListener('resize', handleScroll)
})
</script>