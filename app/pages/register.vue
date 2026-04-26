<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const user = useSupabaseUser()
watchEffect(() => { if (user.value) navigateTo('/') })

const { email, password, displayName, showPassword, togglePassword, error, loading, submit } = useRegister()
</script>

<template>
  <div class="w-full max-w-md animate-slide-up">
    <div class="h-1 bg-frame-500 animate-expand-x" style="clip-path: polygon(0 0, calc(100% - 1.5rem) 0, 100% 100%, 0 100%);" />

    <div
      class="bg-armor-800 border border-armor-600 p-8 relative"
      style="clip-path: polygon(0 0, calc(100% - 1.5rem) 0, 100% 1.5rem, 100% 100%, 0 100%);"
    >
      <span class="absolute top-4 right-6 w-2 h-2 bg-decal-500 block animate-pulse-decal" />

      <div class="mb-8">
        <h1 class="font-mecha text-3xl font-bold text-frame-500 tracking-widest uppercase">Memory Forge</h1>
        <p class="font-ui text-weapon-400 text-sm mt-1 tracking-wider uppercase">New Pilot Registration</p>
      </div>

      <form class="space-y-5" @submit.prevent="submit">
        <!-- email -->
        <div class="space-y-1">
          <label for="reg-email" class="font-ui text-xs text-weapon-400 tracking-widest uppercase block">Email</label>
          <input
            id="reg-email"
            v-model="email"
            type="email"
            required
            :disabled="loading"
            placeholder="pilot@federation.com"
            class="w-full bg-armor-700 border text-white font-ui text-sm px-4 py-3 outline-none transition-colors placeholder:text-weapon-500 disabled:opacity-50"
            :class="error ? 'border-decal-500' : 'border-weapon-500 focus:border-frame-500'"
            style="clip-path: polygon(0 0, calc(100% - 0.5rem) 0, 100% 0.5rem, 100% 100%, 0 100%);"
          />
        </div>

        <!-- password -->
        <div class="space-y-1">
          <label for="reg-password" class="font-ui text-xs text-weapon-400 tracking-widest uppercase block">Password</label>
          <div class="relative">
            <input
              id="reg-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              :disabled="loading"
              placeholder="••••••••"
              class="w-full bg-armor-700 border text-white font-ui text-sm px-4 py-3 pr-12 outline-none transition-colors placeholder:text-weapon-500 disabled:opacity-50"
              :class="error ? 'border-decal-500' : 'border-weapon-500 focus:border-frame-500'"
              style="clip-path: polygon(0 0, calc(100% - 0.5rem) 0, 100% 0.5rem, 100% 100%, 0 100%);"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-weapon-400 hover:text-frame-500 transition-colors"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              @click.prevent="togglePassword"
            >
              <Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- display name -->
        <div class="space-y-1">
          <label for="reg-display-name" class="font-ui text-xs text-weapon-400 tracking-widest uppercase block">
            Display Name
            <span class="text-weapon-500 normal-case ml-1">(optional)</span>
          </label>
          <input
            id="reg-display-name"
            v-model="displayName"
            type="text"
            :disabled="loading"
            placeholder="Defaults to your email"
            class="w-full bg-armor-700 border border-weapon-500 text-white font-ui text-sm px-4 py-3 outline-none transition-colors focus:border-frame-500 placeholder:text-weapon-500 disabled:opacity-50"
            style="clip-path: polygon(0 0, calc(100% - 0.5rem) 0, 100% 0.5rem, 100% 100%, 0 100%);"
          />
        </div>

        <!-- error -->
        <Transition name="error-slide">
          <div v-if="error" class="flex items-start gap-2 bg-decal-600/20 border border-decal-500 px-4 py-3">
            <span class="w-1.5 h-1.5 bg-decal-500 mt-1.5 shrink-0 block" />
            <p class="font-ui text-decal-500 text-sm leading-snug">{{ error }}</p>
          </div>
        </Transition>

        <!-- submit -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full font-mecha text-sm font-bold tracking-widest uppercase py-3 px-6 transition-all duration-200 active:scale-95 disabled:cursor-not-allowed"
          :class="loading
            ? 'bg-armor-600 text-weapon-400 opacity-70'
            : 'bg-armor-600 hover:bg-frame-500 text-white hover:text-armor-900 hover:shadow-glow-gold'"
          style="clip-path: polygon(0 0, calc(100% - 0.75rem) 0, 100% 0.75rem, 100% 100%, 0 100%);"
        >
          <span v-if="loading" class="flex items-center justify-center gap-2">
            <span class="w-3 h-3 border border-weapon-400 border-t-transparent animate-spin block" />
            Initializing...
          </span>
          <span v-else>Enlist</span>
        </button>
      </form>

      <p class="font-ui text-weapon-400 text-sm mt-6 text-center">
        Already a pilot?
        <NuxtLink to="/login" class="text-frame-500 hover:text-frame-300 transition-colors ml-1">
          Sign In
        </NuxtLink>
      </p>
    </div>

    <div class="h-px bg-armor-600 animate-fade-in" />
  </div>
</template>
