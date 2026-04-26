<script setup lang="ts">
const props = defineProps<{ name: string }>()

const isEmailAddress = computed(() => props.name.includes('@'))

const resolvedName = computed(() =>
  isEmailAddress.value ? 'UNKNOWN_GRUNT' : (props.name || 'PILOT'),
)

const nameRef = computed(() => resolvedName.value)
const { display, trigger } = useTextScramble(nameRef)
</script>

<template>
  <div
    class="flex items-center gap-2 cursor-pointer select-none group"
    :title="isEmailAddress ? 'Register a callsign, rookie. Your email is not a name.' : 'Click to rescan'"
    @click="trigger"
  >
    <!-- Bracket left -->
    <span class="font-mecha text-xs text-weapon-500 group-hover:text-frame-700 transition-colors">[ </span>

    <!-- Scrambled name -->
    <span
      class="font-mecha text-sm tracking-widest animate-holo-flicker transition-colors"
      :class="isEmailAddress ? 'text-decal-500' : 'text-frame-500'"
      :style="isEmailAddress
        ? 'text-shadow: 0 0 8px rgba(194,24,7,0.7), 0 0 18px rgba(194,24,7,0.3)'
        : 'text-shadow: 0 0 8px rgba(212,175,55,0.7), 0 0 18px rgba(212,175,55,0.3)'"
    >{{ display }}</span>

    <!-- Blinking cursor -->
    <span class="font-mecha text-xs animate-cursor-blink"
      :class="isEmailAddress ? 'text-decal-500' : 'text-frame-500'"
    >_</span>

    <!-- Bracket right -->
    <span class="font-mecha text-xs text-weapon-500 group-hover:text-frame-700 transition-colors"> ]</span>

    <!-- Mock badge -->
    <Transition name="error-slide">
      <span
        v-if="isEmailAddress"
        class="font-mecha text-xs tracking-widest uppercase px-2 py-0.5 bg-decal-600/20 border border-decal-500 text-decal-500 animate-pulse-decal"
        style="clip-path: polygon(0 0, calc(100% - 0.3rem) 0, 100% 0.3rem, 100% 100%, 0 100%);"
      >
        ⚠ No Callsign
      </span>
    </Transition>
  </div>
</template>
