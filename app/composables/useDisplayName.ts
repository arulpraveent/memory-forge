export function useDisplayName() {
  const displayName = ref(generateDisplayName())

  function regenerate() {
    displayName.value = generateDisplayName()
  }

  return { displayName, regenerate }
}
