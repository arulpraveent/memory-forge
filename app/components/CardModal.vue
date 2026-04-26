<script setup lang="ts">
import type { Card } from '~/stores/card'

const props = defineProps<{
  modelValue: boolean
  deckId: string
  card?: Card | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const cardRef = computed(() => props.card ?? null)
const { front, back, error, loading, isEditing, submit, reset } = useCardForm(props.deckId, cardRef)

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
            class="w-full max-w-lg bg-armor-800 border border-armor-600 relative"
            style="clip-path: polygon(0 0, calc(100% - 1.5rem) 0, 100% 1.5rem, 100% 100%, 0 100%);"
          >
            <div class="h-0.5 bg-frame-500" style="clip-path: polygon(0 0, calc(100% - 1.5rem) 0, 100% 100%, 0 100%);" />

            <div class="p-8 relative">
              <span class="absolute top-4 right-6 w-2 h-2 bg-decal-500 block animate-pulse-decal" />

              <div class="mb-6">
                <h2 class="font-mecha text-2xl font-bold text-frame-500 tracking-widest uppercase">
                  {{ isEditing ? 'Update Data Card' : 'Initialize Data Card' }}
                </h2>
                <p class="font-ui text-weapon-400 text-sm mt-1 tracking-wider uppercase">
                  {{ isEditing ? 'Modify card intel parameters' : 'Deploy a new card to this module' }}
                </p>
              </div>

              <form class="space-y-5" @submit.prevent="handleSubmit">
                <!-- Front -->
                <div class="space-y-1">
                  <label for="card-front" class="font-ui text-xs text-weapon-400 tracking-widest uppercase block">
                    Target Query <span class="text-decal-500">*</span>
                  </label>
                  <textarea
                    id="card-front"
                    v-model="front"
                    :disabled="loading"
                    placeholder="Enter the question or prompt..."
                    rows="3"
                    class="w-full bg-armor-700 border text-white font-ui text-sm px-4 py-3 outline-none transition-colors placeholder:text-weapon-500 disabled:opacity-50 resize-none"
                    :class="error && !front.trim() ? 'border-decal-500' : 'border-weapon-500 focus:border-frame-500'"
                    style="clip-path: polygon(0 0, calc(100% - 0.5rem) 0, 100% 0.5rem, 100% 100%, 0 100%);"
                  />
                </div>

                <!-- Back -->
                <div class="space-y-1">
                  <label for="card-back" class="font-ui text-xs text-weapon-400 tracking-widest uppercase block">
                    Intel Response <span class="text-decal-500">*</span>
                  </label>
                  <textarea
                    id="card-back"
                    v-model="back"
                    :disabled="loading"
                    placeholder="Enter the answer or explanation..."
                    rows="4"
                    class="w-full bg-armor-700 border text-white font-ui text-sm px-4 py-3 outline-none transition-colors placeholder:text-weapon-500 disabled:opacity-50 resize-none"
                    :class="error && !back.trim() ? 'border-decal-500' : 'border-weapon-500 focus:border-frame-500'"
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
                    :class="loading ? 'bg-armor-600 text-weapon-400 opacity-70' : 'bg-armor-600 hover:bg-frame-500 text-white hover:text-armor-900 hover:shadow-glow-gold'"
                    style="clip-path: polygon(0 0, calc(100% - 0.75rem) 0, 100% 0.75rem, 100% 100%, 0 100%);"
                  >
                    <span v-if="loading" class="flex items-center justify-center gap-2">
                      <span class="w-3 h-3 border border-weapon-400 border-t-transparent animate-spin block" />
                      Transmitting...
                    </span>
                    <span v-else>{{ isEditing ? 'Update Card' : 'Deploy Card' }}</span>
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
