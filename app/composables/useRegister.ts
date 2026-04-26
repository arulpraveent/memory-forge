export function useRegister() {
  const authStore = useAuthStore()

  const email = ref('')
  const password = ref('')
  const displayName = ref('')
  const showPassword = ref(false)
  const error = ref('')
  const loading = ref(false)

  function togglePassword() {
    showPassword.value = !showPassword.value
  }

  async function submit() {
    if (!email.value || !password.value) {
      error.value = 'Email and password are required.'
      return
    }

    loading.value = true
    error.value = ''

    try {
      await authStore.register(email.value, password.value, displayName.value)
    }
    catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.'
    }
    finally {
      loading.value = false
    }
  }

  return { email, password, displayName, showPassword, togglePassword, error, loading, submit }
}
