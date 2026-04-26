const GLYPHS = '!<>-_\\/[]{}=+*^?#0123456789ABCDEF▓▒░█'
const FRAME_MS = 28
const STEPS_PER_CHAR = 5

export function useTextScramble(target: Ref<string>) {
  const display = ref(target.value)
  let frameTimer: ReturnType<typeof setInterval> | null = null

  function randomGlyph() {
    return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]!
  }

  function scrambleTo(text: string) {
    if (frameTimer) clearInterval(frameTimer)
    if (!text) { display.value = ''; return }

    let step = 0
    const totalSteps = text.length * STEPS_PER_CHAR

    frameTimer = setInterval(() => {
      const locked = Math.floor(step / STEPS_PER_CHAR)
      display.value = text
        .split('')
        .map((char, i) => i < locked ? char : randomGlyph())
        .join('')

      step++
      if (step > totalSteps) {
        clearInterval(frameTimer!)
        frameTimer = null
        display.value = text
      }
    }, FRAME_MS)
  }

  function stop() {
    if (frameTimer) clearInterval(frameTimer)
  }

  function trigger() {
    scrambleTo(target.value)
  }

  if (import.meta.client) {
    watch(target, (text) => {
      stop()
      scrambleTo(text)
    }, { immediate: true })

    onUnmounted(stop)
  }
  else {
    display.value = target.value
  }

  return { display, trigger }
}
