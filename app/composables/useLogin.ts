export function useLogin() {
  const authStore = useAuthStore()

  const email = ref('')
  const password = ref('')
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
      await authStore.login(email.value, password.value)
    }
    catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'An unexpected error occurred. Please try again.'
    }
    finally {
      loading.value = false
    }
  }

  return { email, password, showPassword, togglePassword, error, loading, submit }
}
