<template>
  <Sidebar v-bind="props" class="border-r border-sidebar">
    <SidebarHeader class="p-4 border-b border-sidebar">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <div class="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-primary/60"></div>
        </div>
        <div class="flex flex-col">
          <span class="font-semibold text-sm text-sidebar-foreground">Inventory App</span>
          <span class="text-xs text-muted-foreground">v1.0.0</span>
        </div>
      </div>
    </SidebarHeader>

    <SidebarContent class="gap-0 p-2">
      <SidebarMenu>
        <SidebarMenuItem
          v-for="item in navMain"
          :key="item.title"
          class="mb-0.5 last:mb-0"
        >
          <!-- Menu tanpa children -->
          <div v-if="!item.items?.length">
            <SidebarMenuButton
              as-child
              :is-active="isItemActive(item)"
              class="w-full"
            >
              <NuxtLink
                :to="item.url"
                class="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:border-l-2 data-[active=true]:border-l-primary"
              >
                <div class="w-5 h-5 flex items-center justify-center">
                  <component :is="item.icon" class="w-4 h-4 shrink-0 text-sidebar-foreground" />
                </div>
                <span class="truncate text-sidebar-foreground">{{ item.title }}</span>
              </NuxtLink>
            </SidebarMenuButton>
          </div>

          <!-- Menu dengan children -->
          <div v-else>
            <Collapsible
              v-model:open="openStates[item.title]"
              class="w-full"
            >
              <SidebarMenuButton
                as-child
                :is-active="isParentActive(item)"
                class="w-full"
              >
                <CollapsibleTrigger
                  class="flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-primary/10 data-[active=true]:text-primary group/collapsible"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-5 h-5 flex items-center justify-center">
                      <component :is="item.icon" class="w-4 h-4 shrink-0 text-sidebar-foreground" />
                    </div>
                    <span class="truncate flex-1 text-left text-sidebar-foreground">{{ item.title }}</span>
                  </div>
                  <ChevronRight
                    class="w-3.5 h-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 text-muted-foreground"
                  />
                </CollapsibleTrigger>
              </SidebarMenuButton>

              <CollapsibleContent class="overflow-hidden">
                <SidebarGroupContent class="mt-0.5 ml-7">
                  <SidebarMenu class="space-y-0.5">
                    <SidebarMenuItem
                      v-for="childItem in item.items"
                      :key="childItem.title"
                    >
                      <TooltipProvider :delay-duration="300">
                        <Tooltip>
                          <TooltipTrigger as-child>
                            <SidebarMenuButton
                              as-child
                              :is-active="isChildActive(childItem)"
                              class="w-full px-2.5 py-1.5 rounded-md text-sm transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-medium"
                            >
                              <NuxtLink
                                :to="childItem.url"
                                class="flex items-center gap-2.5 w-full"
                              >
                                <div class="w-4 h-4 flex items-center justify-center">
                                  <component
                                    v-if="childItem.icon"
                                    :is="childItem.icon"
                                    class="w-3 h-3 text-sidebar-foreground"
                                  />
                                </div>
                                <span class="truncate text-sidebar-foreground">{{ childItem.title }}</span>
                              </NuxtLink>
                            </SidebarMenuButton>
                          </TooltipTrigger>
                          <TooltipContent
                            side="right"
                            :side-offset="10"
                            class="bg-sidebar text-sidebar-foreground border border-sidebar-border shadow-lg text-sm"
                          >
                            <p class="font-medium">{{ childItem.title }}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarContent>

    <SidebarRail />
  </Sidebar>
</template>

<script setup lang="ts">
import type { SidebarProps } from '@/components/ui/sidebar'
import {
  ChevronRight,
  LayoutDashboard,
  Database,
  Settings,
  ArrowBigDown,
  ArrowBigUp,
  House,
  BoxIcon,
  RefreshCcwIcon,
  BoxesIcon,
  Warehouse,
  WarehouseIcon,
  Layers2Icon,
  LayoutGridIcon,
  RulerIcon,
} from 'lucide-vue-next'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const props = defineProps<SidebarProps>()
const route = useRoute()

interface NavItem {
  title: string
  url: string
  icon: any
  items?: NavItem[]
}

const openStates = ref<Record<string, boolean>>({})

const navMain = computed<NavItem[]>(() => [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Master Data',
    url: '/#',
    icon: Database,
    items: [
      { title: 'Barang', url: '/master-data', icon: BoxIcon },
      { title: 'Gudang', url: '/gudang', icon: WarehouseIcon },
      { title: 'Kategori', url: '/kategori', icon: Layers2Icon },
      { title: 'Sub Kategori', url: '/sub-kategori', icon: LayoutGridIcon },
      { title: 'Satuan', url: '/satuan', icon: RulerIcon },
    ],
  },
  {
    title: 'Transaksi',
    url: '#',
    icon: RefreshCcwIcon,
    items: [
      { title: 'Inventory In', url: '/inventory-in', icon: ArrowBigDown },
      { title: 'Transfer Gudang', url: '/transfer', icon: House },
      { title: 'Inventory Out', url: '/inventory-out', icon: ArrowBigUp },
    ],
  },
  {
    title: 'Stok',
    url: '/stock',
    icon: BoxesIcon,
  },
  {
    title: 'Pengaturan',
    url: '#',
    icon: Settings,
  },
])

const isChildActive = (childItem: NavItem) => {
  return route.path === childItem.url || route.path.startsWith(childItem.url + '/')
}

const isParentActive = (item: NavItem) => {
  return item.items?.some((child) => isChildActive(child)) || false
}

const isItemActive = (item: NavItem) => {
  return route.path === item.url || route.path.startsWith(item.url + '/')
}

watch(
  () => route.path,
  (currentPath) => {
    navMain.value.forEach((item) => {
      if (
        item.items?.some((child) => {
          return currentPath === child.url || currentPath.startsWith(child.url + '/')
        })
      ) {
        openStates.value[item.title] = true
      }
    })
  },
  { immediate: true },
)
</script>

<style scoped>
::v-deep([data-active='true']) {
  position: relative;
}

::v-deep([data-active='true'])::before {
  content: '';
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 4px;
  width: 3px;
  background: linear-gradient(
    to bottom,
    var(--primary),
    color-mix(in oklch, var(--primary) 80%, transparent)
  );
  border-radius: 0 2px 2px 0;
}
</style>
