import { defineStore } from "pinia"
import axios from "axios"
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth"
import { auth } from "../config/firebase"
import router from "../router"

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((request) => {
  console.log("Starting Request:", request)
  return request
})

api.interceptors.response.use(
  (response) => {
    console.log("Response:", response)
    return response
  },
  (error) => {
    console.error("API Error:", error.response || error)
    if (error.code?.startsWith("auth/")) {
      const errorMessage = getFirebaseErrorMessage(error.code)
      return Promise.reject(new Error(errorMessage))
    }
    return Promise.reject(error)
  },
)

const getFirebaseErrorMessage = (code) => {
  const messages = {
    "auth/popup-closed-by-user": "Sign-in window was closed. Please try again.",
    "auth/cancelled-popup-request": "Sign-in operation cancelled due to another popup being opened.",
    "auth/popup-blocked": "Sign-in popup was blocked by your browser. Please allow popups and try again.",
    "auth/unauthorized-domain": "This domain is not authorized for Google Sign-In.",
    "auth/operation-not-allowed": "Google Sign-In is not enabled. Please contact support.",
  }
  return messages[code] || "An error occurred during sign in. Please try again."
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    loading: false,
    error: null,
    initialized: false,
    userProfile: null,
    isRedirecting: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
  },

  actions: {
    async init() {
      if (this.initialized) return

      return new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
          this.user = user

          if (user) {
            try {
              const token = await user.getIdToken()
              api.defaults.headers.common["Authorization"] = `Bearer ${token}`

              const response = await api.get("/auth/profile")
              this.userProfile = response.data
            } catch (error) {
              console.error("Error fetching user profile:", error)
              this.userProfile = null
            }
          } else {
            delete api.defaults.headers.common["Authorization"]
            this.userProfile = null
          }

          this.initialized = true
          resolve(user)
        })
      })
    },

    async register(userData) {
      try {
        const response = await api.post("/auth/register", userData)
        return response.data
      } catch (error) {
        if (error.response) {
          throw new Error(error.response.data.error || "Registration failed")
        }
        throw error
      }
    },

    async verifyEmail({ userId, code }) {
      try {
        const response = await api.post("/auth/verify-code", { userId, code })
        return response.data
      } catch (error) {
        if (error.response) {
          throw new Error(error.response.data.error || "Verification failed")
        }
        throw error
      }
    },

    async resendVerificationCode(userId) {
      try {
        const response = await api.post("/auth/resend-code", { userId })
        return response.data
      } catch (error) {
        if (error.response) {
          throw new Error(error.response.data.error || "Failed to resend code")
        }
        throw error
      }
    },

    async login(credentials) {
      try {
        const response = await api.post("/auth/login", credentials)
        const { token, user } = response.data

        api.defaults.headers.common["Authorization"] = `Bearer ${token}`
        this.user = user
        this.userProfile = user
        return user
      } catch (error) {
        if (error.response) {
          throw new Error(error.response.data.error || "Login failed")
        }
        throw error
      }
    },

    async signInWithGoogle() {
      this.loading = true
      this.error = null
      this.isRedirecting = false

      try {
        const provider = new GoogleAuthProvider()
        provider.setCustomParameters({
          prompt: "select_account",
        })

        const result = await signInWithPopup(auth, provider)
        const idToken = await result.user.getIdToken()

        const response = await api.post("/auth/google", {
          idToken,
          user: {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
          },
        })

        const { token, user } = response.data
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`
        this.user = user
        this.userProfile = user
        this.isRedirecting = true

        await router.push("/dashboard")

        return user
      } catch (error) {
        console.error("Google Sign In error:", error)
        this.error = getFirebaseErrorMessage(error.code) || error.message
        throw error
      } finally {
        this.loading = false
        this.isRedirecting = false
      }
    },

    async logout() {
      try {
        await signOut(auth)
        delete api.defaults.headers.common["Authorization"]
        this.user = null
        this.userProfile = null
        router.push("/login")
      } catch (error) {
        console.error("Logout error:", error)
        throw error
      }
    },

    async updateProfile(profileData) {
      try {
        const response = await api.put(`/auth/profile/${this.user.uid}`, profileData)
        this.userProfile = response.data
        return response.data
      } catch (error) {
        console.error("Update profile error:", error)
        throw error
      }
    },
  },
})

