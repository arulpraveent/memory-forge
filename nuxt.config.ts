import tailwindcss from "@tailwindcss/vite"

export default defineNuxtConfig({
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4,
  },
  vite: {
    plugins:[
      tailwindcss(),
    ],
  },
  imports: {
    dirs:['shared/schemas']
  },
  css:['~/assets/css/main.css'],
  modules:['@nuxtjs/supabase', '@nuxt/icon', '@pinia/nuxt'],
  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/register'],
    },
  },
  app: {
    head: {
      link:[
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&family=Rajdhani:wght@400;500;600;700&display=swap' }
      ]
    }
  },
  alias: {
    cookie: 'cookie-es',
  },
  runtimeConfig: {
    // Backend-only secrets go here (never in runtimeConfig.public)
    public: {
      // Only browser-safe values here — Supabase URL/key are managed by @nuxtjs/supabase
    },
  },
})