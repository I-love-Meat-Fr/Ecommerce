import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi, setStoredToken } from '../services/api'

// Auth store: holds user + token, syncs token to both localStorage and the
// axios Bearer interceptor via setStoredToken.
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      expiresAt: null,
      isLoading: false,
      error: null,

      isAuthenticated: () => {
        const { token, expiresAt } = get()
        if (!token) return false
        if (expiresAt && new Date(expiresAt) <= new Date()) return false
        return true
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const data = await authApi.login(email, password)
          const user = {
            email: data.email,
            fullName: data.fullName,
            role: data.role,
          }
          setStoredToken(data.token)
          set({
            user,
            token: data.token,
            expiresAt: data.expiresAt,
            isLoading: false,
            error: null,
          })
          return user
        } catch (err) {
          const message =
            err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.'
          set({ isLoading: false, error: message })
          throw err
        }
      },

      register: async (payload) => {
        set({ isLoading: true, error: null })
        try {
          const data = await authApi.register(payload)
          const user = {
            email: data.email,
            fullName: data.fullName,
            role: data.role,
          }
          setStoredToken(data.token)
          set({
            user,
            token: data.token,
            expiresAt: data.expiresAt,
            isLoading: false,
            error: null,
          })
          return user
        } catch (err) {
          const message =
            err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.'
          set({ isLoading: false, error: message })
          throw err
        }
      },

      logout: () => {
        setStoredToken(null)
        set({ user: null, token: null, expiresAt: null, error: null })
      },

      // Pull the latest user record from /api/users/me so the in-memory copy
      // reflects server-side changes (e.g. after editing the profile).
      refreshUser: async () => {
        try {
          const data = await authApi.me()
          set({ user: { email: data.email, fullName: data.fullName, role: data.role } })
        } catch {
          // ignore — caller already handled the UI feedback
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'florist-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        expiresAt: state.expiresAt,
      }),
      onRehydrateStorage: () => (state) => {
        // After rehydration, sync the token into the axios key used by the
        // request interceptor so the first protected call works.
        if (state?.token) setStoredToken(state.token)
      },
    }
  )
)

// Listen for auto-logout events fired by the axios response interceptor.
if (typeof window !== 'undefined') {
  window.addEventListener('florist:auth:logout', () => {
    useAuthStore.getState().logout()
  })
}
