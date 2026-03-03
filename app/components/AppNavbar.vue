<template>
  <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="flex h-14 bg-sidebar items-center px-4">
      <!-- Sidebar toggle -->
      <SidebarTrigger class="mr-4" />

      <div class="flex-1"></div>

      <!-- User dropdown -->
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="ghost" class="relative h-8 gap-2">
            <Avatar class="h-7 w-7">
              <AvatarFallback class="bg-primary text-white text-xs">
                {{ getUserInitials() }}
              </AvatarFallback>
            </Avatar>
            <span class="hidden sm:inline-block text-sm font-medium">
              {{ username }}
            </span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" class="w-56">
          <DropdownMenuLabel class="font-normal">
            <div class="flex flex-col space-y-1">
              <p class="text-sm font-medium leading-none">{{ username }}</p>
              <p class="text-xs leading-none text-muted-foreground">{{ email }}</p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem @click="handleLogout" class="text-red-600 cursor-pointer">
            <LogOut class="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </header>
</template>

<script setup lang="ts">
import { LogOut } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '~/hooks/use-toast'

const authStore = useAuthStore()
const { toast } = useToast()

// Ambil dari authStore, bukan dummy
const username = computed(() => authStore.user?.name ?? '—')
const email = computed(() => authStore.user?.email ?? '')

function getUserInitials(): string {
  const names = username.value.split(' ')
  if (names.length >= 2 && names[0] && names[1]) {
    return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase()
  }
  return username.value.charAt(0).toUpperCase()
}

async function handleLogout() {
  await authStore.logout()

  toast({
    title: 'Logged out',
    description: "You've been logged out successfully.",
    variant: 'success',
  })
}
</script>