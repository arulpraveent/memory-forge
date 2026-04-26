<script setup lang="ts">
import type { Deck } from '~/stores/deck'

const props = defineProps<{
  modelValue: boolean
  deck?: Deck | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const deckRef = computed(() => props.deck ?? null)
const { name, description, error, loading, isEditing, submit, reset } = useDeckForm(deckRef)

watch(() => props.modelValue, (open) => {
  if (open) reset()
})

function close() {
  emit('update:modelValue', false)
}

async function handleSubmit() {
  await submit()
  if (!error.value) {
    emit('saved')
    close()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-6"
        @click.self="close"
      >
        <Transition name="modal-panel" appear>
          <div
            v-if="modelValue"
            class="w-full max-w-md bg-armor-800 border border-armor-600 relative"
            style="clip-path: polygon(0 0, calc(100% - 1.5rem) 0, 100% 1.5rem, 100% 100%, 0 100%);"
          >
            <!-- Gold bar -->
            <div class="h-0.5 bg-frame-500" style="clip-path: polygon(0 0, calc(100% - 1.5rem) 0, 100% 100%, 0 100%);" />

            <div class="p-8 relative">
              <!-- Decal dot -->
              <span class="absolute top-4 right-6 w-2 h-2 bg-decal-500 block animate-pulse-decal" />

              <!-- Title -->
              <div class="mb-6">
                <h2 class="font-mecha text-2xl font-bold text-frame-500 tracking-widest uppercase">
                  {{ isEditing ? 'Update Intel' : 'Deploy Module' }}
                </h2>
                <p class="font-ui text-weapon-400 text-sm mt-1 tracking-wider uppercase">
                  {{ isEditing ? 'Modify data module parameters' : 'Initialize a new data module' }}
                </p>
              </div>

              <form class="space-y-5" @submit.prevent="handleSubmit">
                <!-- Name -->
                <div class="space-y-1">
                  <label for="deck-name" class="font-ui text-xs text-weapon-400 tracking-widest uppercase block">
                    Module Designation <span class="text-decal-500">*</span>
                  </label>
                  <input
                    id="deck-name"
                    v-model="name"
                    type="text"
                    required
                    :disabled="loading"
                    placeholder="e.g. Operation Meteor, U.C. Tactics"
                    class="w-full bg-armor-700 border text-white font-ui text-sm px-4 py-3 outline-none transition-colors placeholder:text-weapon-500 disabled:opacity-50"
                    :class="error ? 'border-decal-500' : 'border-weapon-500 focus:border-frame-500'"
                    style="clip-path: polygon(0 0, calc(100% - 0.5rem) 0, 100% 0.5rem, 100% 100%, 0 100%);"
                  />
                </div>

                <!-- Description -->
                <div class="space-y-1">
                  <label for="deck-description" class="font-ui text-xs text-weapon-400 tracking-widest uppercase block">
                    Briefing
                    <span class="text-weapon-500 normal-case ml-1">(optional)</span>
                  </label>
                  <textarea
                    id="deck-description"
                    v-model="description"
                    :disabled="loading"
                    placeholder="Intel notes for this combat data module..."
                    rows="3"
                    class="w-full bg-armor-700 border border-weapon-500 text-white font-ui text-sm px-4 py-3 outline-none transition-colors focus:border-frame-500 placeholder:text-weapon-500 disabled:opacity-50 resize-none"
                    style="clip-path: polygon(0 0, calc(100% - 0.5rem) 0, 100% 0.5rem, 100% 100%, 0 100%);"
                  />
                </div>

                <!-- Error -->
                <Transition name="error-slide">
                  <div v-if="error" class="flex items-start gap-2 bg-decal-600/20 border border-decal-500 px-4 py-3">
                    <span class="w-1.5 h-1.5 bg-decal-500 mt-1.5 shrink-0 block" />
                    <p class="font-ui text-decal-500 text-sm leading-snug">{{ error }}</p>
                  </div>
                </Transition>

                <!-- Buttons -->
                <div class="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    :disabled="loading"
                    class="flex-1 font-mecha text-sm font-bold tracking-widest uppercase py-3 px-4 bg-armor-700 border border-armor-600 text-weapon-400 hover:text-white hover:border-weapon-400 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    style="clip-path: polygon(0 0, calc(100% - 0.75rem) 0, 100% 0.75rem, 100% 100%, 0 100%);"
                    @click.prevent="close"
                  >
                    Abort
                  </button>
                  <button
                    type="submit"
                    :disabled="loading"
                    class="flex-1 font-mecha text-sm font-bold tracking-widest uppercase py-3 px-4 transition-all duration-200 active:scale-95 disabled:cursor-not-allowed"
                    :class="loading
                      ? 'bg-armor-600 text-weapon-400 opacity-70'
                      : 'bg-armor-600 hover:bg-frame-500 text-white hover:text-armor-900 hover:shadow-glow-gold'"
                    style="clip-path: polygon(0 0, calc(100% - 0.75rem) 0, 100% 0.75rem, 100% 100%, 0 100%);"
                  >
                    <span v-if="loading" class="flex items-center justify-center gap-2">
                      <span class="w-3 h-3 border border-weapon-400 border-t-transparent animate-spin block" />
                      Transmitting...
                    </span>
                    <span v-else>{{ isEditing ? 'Update Intel' : 'Deploy Module' }}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
