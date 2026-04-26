<script setup lang="ts">
const authStore = useAuthStore()
const route = useRoute()
const supabase = useSupabaseClient()

const loadingLogout = ref(false)
const displayName = ref('')

onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  displayName.value = data?.display_name ?? user.email ?? ''
})

async function handleLogout() {
  loadingLogout.value = true
  try {
    await authStore.logout()
  }
  finally {
    loadingLogout.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-armor-900 flex flex-col">
    <!-- Header — exactly 3 items -->
    <header class="h-16 bg-armor-800 border-b border-armor-600 sticky top-0 z-40 flex flex-col">
      <div class="h-0.5 bg-frame-500 animate-expand-x shrink-0" style="clip-path: polygon(0 0, calc(100% - 2rem) 0, 100% 100%, 0 100%);" />

      <div class="flex-1 flex items-center justify-between px-4">
        <!-- Logo -->
        <NuxtLink to="/" class="font-mecha text-lg font-bold text-frame-500 tracking-widest uppercase hover:text-frame-300 transition-colors">
          Memory Forge
        </NuxtLink>

        <!-- Pilot Callsign -->
        <DisplayName v-if="displayName" :name="displayName" />

        <!-- Logout -->
        <button
          :disabled="loadingLogout"
          class="font-mecha text-xs tracking-widest uppercase px-4 py-2 bg-armor-700 border border-armor-600 text-weapon-400 hover:bg-decal-600/30 hover:border-decal-500 hover:text-decal-500 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          style="clip-path: polygon(0 0, calc(100% - 0.5rem) 0, 100% 0.5rem, 100% 100%, 0 100%);"
          @click="handleLogout"
        >
          <span v-if="loadingLogout" class="w-3 h-3 border border-weapon-400 border-t-transparent animate-spin block" />
          <Icon v-else name="lucide:power" class="w-3.5 h-3.5" />
          {{ loadingLogout ? 'Standing Down...' : 'Stand Down' }}
        </button>
      </div>
    </header>

    <!-- Body -->
    <div class="flex flex-1">
      <!-- Side nav -->
      <aside class="w-16 shrink-0 bg-armor-800 border-r border-armor-600 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto z-30 flex flex-col">
        <nav class="flex flex-col py-3 gap-0.5">
          <NuxtLink
            to="/"
            title="Sortie"
            class="flex flex-col items-center py-4 gap-1 relative transition-all duration-200"
            :class="route.path === '/' ? 'text-frame-500 bg-frame-500/5' : 'text-weapon-500 hover:text-weapon-400 hover:bg-armor-700'"
          >
            <span v-if="route.path === '/'" class="absolute left-0 inset-y-0 w-0.5 bg-frame-500 animate-expand-x" style="transform-origin: top;" />
            <Icon name="lucide:crosshair" class="w-4 h-4" />
            <span class="font-mecha text-[9px] tracking-widest uppercase">Sortie</span>
          </NuxtLink>

          <NuxtLink
            to="/decks"
            title="Hangar"
            class="flex flex-col items-center py-4 gap-1 relative transition-all duration-200"
            :class="route.path.startsWith('/decks') ? 'text-frame-500 bg-frame-500/5' : 'text-weapon-500 hover:text-weapon-400 hover:bg-armor-700'"
          >
            <span v-if="route.path.startsWith('/decks')" class="absolute left-0 inset-y-0 w-0.5 bg-frame-500 animate-expand-x" style="transform-origin: top;" />
            <Icon name="lucide:layout-grid" class="w-4 h-4" />
            <span class="font-mecha text-[9px] tracking-widest uppercase">Hangar</span>
          </NuxtLink>
        </nav>

        <!-- Bottom decal -->
        <div class="mt-auto p-3 flex justify-center">
          <span class="w-1.5 h-1.5 bg-decal-500/40 block animate-pulse-decal" />
        </div>
      </aside>

      <!-- Page content -->
      <main class="flex-1 px-6 py-8">
        <div class="max-w-7xl mx-auto">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
