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
    <!-- Header -->
    <header class="bg-armor-800 border-b border-armor-600 sticky top-0 z-40">
      <div class="h-0.5 bg-frame-500 animate-expand-x" style="clip-path: polygon(0 0, calc(100% - 2rem) 0, 100% 100%, 0 100%);" />

      <div class="flex items-center justify-between px-6 py-4">
        <!-- Logo -->
        <NuxtLink to="/" class="font-mecha text-xl font-bold text-frame-500 tracking-widest uppercase hover:text-frame-300 transition-colors">
          Memory Forge
        </NuxtLink>

        <!-- Nav -->
        <nav class="flex items-center gap-1">
          <NuxtLink
            to="/"
            class="font-ui text-xs tracking-widest uppercase px-4 py-2 transition-colors"
            :class="route.path === '/' ? 'text-frame-500' : 'text-weapon-400 hover:text-white'"
          >
            <span class="flex items-center gap-2">
              <Icon name="lucide:crosshair" class="w-3.5 h-3.5" />
              Sortie
            </span>
          </NuxtLink>

          <div class="w-px h-4 bg-armor-600" />

          <NuxtLink
            to="/decks"
            class="font-ui text-xs tracking-widest uppercase px-4 py-2 transition-colors"
            :class="route.path.startsWith('/decks') ? 'text-frame-500' : 'text-weapon-400 hover:text-white'"
          >
            <span class="flex items-center gap-2">
              <Icon name="lucide:layout-grid" class="w-3.5 h-3.5" />
              Hangar
            </span>
          </NuxtLink>
        </nav>

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

    <!-- Page content -->
    <main class="flex-1 px-6 py-8 max-w-7xl mx-auto w-full">
      <slot />
    </main>
  </div>
</template>
