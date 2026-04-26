import type { Database } from '~/types/database.types'

export const useAuthStore = defineStore('auth', () => {
  const supabase = useSupabaseClient<Database>()

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    await navigateTo('/')
  }

  async function register(email: string, password: string, displayName?: string) {
    const resolvedName = displayName?.trim() || email
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: resolvedName } },
    })
    if (error || !data.user) throw error ?? new Error('Registration failed. Please try again.')

    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      email,
      display_name: resolvedName,
    })
    if (profileError) throw profileError

    await navigateTo('/')
  }

  return { login, register }
})
