<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const deckId = route.params.id as string

const { data: deck } = await useFetch(`/api/decks/${deckId}`)

const { loading, submitting, error, revealed, currentCard, isComplete, progress, sessionCards, scheduleMap, init, reveal, rate } = useReview(deckId)

const progressPct = computed(() =>
  sessionCards.value.length === 0 ? 0 : ((progress.value.current - 1) / sessionCards.value.length) * 100,
)

function formatDue(iso: string | undefined): string {
  if (!iso) return '···'
  const diff = new Date(iso).getTime() - Date.now()
  const mins = Math.round(diff / 60000)
  if (mins < 1) return '<1m'
  if (mins < 60) return `${mins}m`
  const hours = Math.round(diff / 3600000)
  if (hours < 24) return `${hours}h`
  const days = Math.round(diff / 86400000)
  if (days < 30) return `${days}d`
  return `${Math.round(days / 30)}mo`
}

onMounted(() => init())
</script>

<template>
  <!-- Main content -->
  <div class="animate-fade-in max-w-2xl mx-auto pb-36">
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 mb-6 font-ui text-xs text-weapon-500 tracking-widest uppercase">
      <NuxtLink to="/" class="hover:text-frame-500 transition-colors flex items-center gap-1.5">
        <Icon name="lucide:crosshair" class="w-3 h-3" />
        Sortie
      </NuxtLink>
      <Icon name="lucide:chevron-right" class="w-3 h-3" />
      <span class="text-frame-500 truncate max-w-48">{{ deck?.name ?? 'Module' }}</span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-6">
      <div class="h-3 bg-armor-700 animate-pulse" style="clip-path: polygon(0 0, calc(100% - 0.5rem) 0, 100% 0.5rem, 100% 100%, 0 100%);" />
      <div class="h-72 bg-armor-800 border border-armor-600 animate-pulse" style="clip-path: polygon(0 0, calc(100% - 1.5rem) 0, 100% 1.5rem, 100% 100%, 0 100%);" />
    </div>

    <!-- Error -->
    <Transition name="error-slide">
      <div v-if="error && !loading && !revealed" class="flex items-start gap-2 bg-decal-600/20 border border-decal-500 px-4 py-3 mb-6">
        <span class="w-1.5 h-1.5 bg-decal-500 mt-1.5 shrink-0 block" />
        <p class="font-ui text-decal-500 text-sm leading-snug">{{ error }}</p>
      </div>
    </Transition>

    <!-- Complete state -->
    <div
      v-if="!loading && isComplete"
      class="flex flex-col items-center justify-center py-20 text-center animate-slide-up"
    >
      <div class="w-20 h-20 bg-frame-500/10 border border-frame-700 flex items-center justify-center mb-6" style="clip-path: polygon(0 0, calc(100% - 1.25rem) 0, 100% 1.25rem, 100% 100%, 0 100%);">
        <Icon name="lucide:shield-check" class="w-9 h-9 text-frame-500" />
      </div>
      <h2 class="font-mecha text-3xl font-bold text-white tracking-widest uppercase mb-2">
        Sortie Complete
      </h2>
      <p class="font-ui text-weapon-400 text-sm tracking-wider mb-8">
        {{ sessionCards.length }} data {{ sessionCards.length === 1 ? 'card' : 'cards' }} processed. Mission accomplished.
      </p>
      <div class="flex items-center gap-3">
        <NuxtLink
          to="/"
          class="font-mecha text-sm font-bold tracking-widest uppercase py-3 px-6 bg-armor-700 border border-armor-600 text-weapon-400 hover:text-white hover:border-weapon-400 transition-all duration-200 active:scale-95"
          style="clip-path: polygon(0 0, calc(100% - 0.75rem) 0, 100% 0.75rem, 100% 100%, 0 100%);"
        >
          Return to Base
        </NuxtLink>
        <NuxtLink
          :to="`/decks/${deckId}/manage`"
          class="font-mecha text-sm font-bold tracking-widest uppercase py-3 px-6 bg-armor-700 border border-armor-600 text-white hover:bg-frame-500 hover:text-armor-900 hover:border-frame-500 hover:shadow-glow-gold transition-all duration-200 active:scale-95"
          style="clip-path: polygon(0 0, calc(100% - 0.75rem) 0, 100% 0.75rem, 100% 100%, 0 100%);"
        >
          Manage Cards
        </NuxtLink>
      </div>
    </div>

    <!-- Review session -->
    <div v-else-if="!loading && currentCard">
      <!-- Progress -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-2">
          <span class="font-ui text-xs text-weapon-400 tracking-widest uppercase">
            Target {{ progress.current }} of {{ progress.total }}
          </span>
          <span class="font-mecha text-xs text-frame-500 tracking-widest">
            {{ Math.round(progressPct) }}%
          </span>
        </div>
        <div class="h-1 bg-armor-700 relative overflow-hidden" style="clip-path: polygon(0 0, calc(100% - 0.25rem) 0, 100% 0.25rem, 100% 100%, 0 100%);">
          <div
            class="h-full bg-frame-500 transition-all duration-500"
            :style="{ width: `${progressPct}%` }"
          />
        </div>
      </div>

      <!-- Flashcard -->
      <div
        class="bg-armor-800 border border-armor-600 relative"
        style="clip-path: polygon(0 0, calc(100% - 1.5rem) 0, 100% 1.5rem, 100% 100%, 0 100%);"
      >
        <div class="absolute top-0 left-0 w-20 h-0.5 bg-frame-500" />
        <span class="absolute top-4 right-6 w-2 h-2 bg-decal-500 block animate-pulse-decal" />

        <!-- Front -->
        <div class="p-8">
          <div class="mb-3">
            <span class="font-ui text-xs text-weapon-500 tracking-widest uppercase">Target Query</span>
          </div>
          <p class="font-ui text-white text-xl leading-relaxed">
            {{ currentCard.front }}
          </p>
        </div>

        <!-- Back reveal -->
        <Transition name="card-reveal">
          <div v-if="revealed" class="border-t border-armor-600 p-8">
            <div class="mb-3">
              <span class="font-ui text-xs text-frame-500 tracking-widest uppercase flex items-center gap-2">
                <span class="w-1.5 h-1.5 bg-frame-500 block" />
                Intel Response
              </span>
            </div>
            <p class="font-ui text-weapon-400 text-lg leading-relaxed">
              {{ currentCard.back }}
            </p>
          </div>
        </Transition>
      </div>

      <!-- Reveal button -->
      <div v-if="!revealed" class="flex justify-center mt-6">
        <button
          class="font-mecha text-sm font-bold tracking-widest uppercase py-3 px-10 bg-armor-700 border border-armor-600 text-white hover:bg-frame-500 hover:text-armor-900 hover:border-frame-500 hover:shadow-glow-gold transition-all duration-200 active:scale-95 flex items-center gap-2"
          style="clip-path: polygon(0 0, calc(100% - 0.75rem) 0, 100% 0.75rem, 100% 100%, 0 100%);"
          @click="reveal"
        >
          <Icon name="lucide:eye" class="w-4 h-4" />
          Disengage Cover
        </button>
      </div>
    </div>

    <!-- No cards due -->
    <div
      v-else-if="!loading && sessionCards.length === 0"
      class="flex flex-col items-center justify-center py-20 text-center animate-slide-up"
    >
      <div class="w-16 h-16 bg-armor-800 border border-armor-600 flex items-center justify-center mb-6" style="clip-path: polygon(0 0, calc(100% - 1rem) 0, 100% 1rem, 100% 100%, 0 100%);">
        <Icon name="lucide:shield-check" class="w-7 h-7 text-frame-500" />
      </div>
      <h2 class="font-mecha text-xl font-bold text-white tracking-widest uppercase mb-2">
        No Active Targets
      </h2>
      <p class="font-ui text-weapon-400 text-sm tracking-wider mb-6">
        All cards in this module are current. No sortie required.
      </p>
      <div class="flex items-center gap-3">
        <NuxtLink
          to="/"
          class="font-mecha text-sm font-bold tracking-widest uppercase py-3 px-6 bg-armor-700 border border-armor-600 text-weapon-400 hover:text-white hover:border-weapon-400 transition-all duration-200 active:scale-95"
          style="clip-path: polygon(0 0, calc(100% - 0.75rem) 0, 100% 0.75rem, 100% 100%, 0 100%);"
        >
          Return to Base
        </NuxtLink>
        <NuxtLink
          :to="`/decks/${deckId}/manage`"
          class="font-mecha text-sm font-bold tracking-widest uppercase py-3 px-6 bg-armor-700 border border-armor-600 text-white hover:bg-frame-500 hover:text-armor-900 hover:border-frame-500 hover:shadow-glow-gold transition-all duration-200 active:scale-95"
          style="clip-path: polygon(0 0, calc(100% - 0.75rem) 0, 100% 0.75rem, 100% 100%, 0 100%);"
        >
          Manage Cards
        </NuxtLink>
      </div>
    </div>
  </div>

  <!-- Floating rating bar -->
  <Transition name="modal-fade">
    <div
      v-if="revealed && currentCard && !isComplete"
      class="fixed bottom-0 left-16 right-0 z-50 bg-armor-800 shadow-[0_-8px_32px_rgba(0,0,0,0.7)]"
    >
      <!-- Gold accent bar -->
      <div class="h-px bg-gradient-to-r from-frame-700 via-frame-500 to-frame-700" />
      <div class="border-t border-armor-600">
        <div class="max-w-2xl mx-auto px-6 py-4">
          <!-- Header row -->
          <div class="flex items-center justify-between mb-3">
            <span class="font-ui text-[10px] text-weapon-500 tracking-widest uppercase">Assess Performance</span>
            <Transition name="error-slide">
              <div v-if="error" class="flex items-center gap-1.5">
                <span class="w-1 h-1 bg-decal-500 animate-pulse-decal block shrink-0" />
                <span class="font-ui text-xs text-decal-500 truncate max-w-48">{{ error }}</span>
              </div>
            </Transition>
          </div>

          <!-- Rating buttons -->
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="r in RATINGS"
              :key="r.value"
              :disabled="submitting"
              class="flex flex-col items-center gap-0.5 py-3 px-2 border font-mecha tracking-widest uppercase transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              :class="r.style"
              style="clip-path: polygon(0 0, calc(100% - 0.5rem) 0, 100% 0.5rem, 100% 100%, 0 100%);"
              @click="rate(r.value)"
            >
              <span v-if="submitting" class="w-3 h-3 border border-current border-t-transparent animate-spin block mx-auto" />
              <template v-else>
                <span class="text-xs font-bold tracking-widest">{{ r.label }}</span>
                <span class="font-ui text-[10px] opacity-60 normal-case tracking-normal">{{ r.sub }}</span>
                <span class="font-mecha text-[10px] mt-1 opacity-80">
                  {{ formatDue(scheduleMap[r.value]) }}
                </span>
              </template>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
