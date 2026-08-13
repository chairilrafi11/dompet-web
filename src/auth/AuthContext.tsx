import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { AuthResponse } from '../api/types'

interface AuthContextValue {
  token: string | null
  email: string | null
  displayName: string | null
  setAuth: (auth: AuthResponse) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [email, setEmail] = useState<string | null>(() => localStorage.getItem('email'))
  const [displayName, setDisplayName] = useState<string | null>(() => localStorage.getItem('displayName'))

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      email,
      displayName,
      setAuth: (auth) => {
        localStorage.setItem('token', auth.token)
        localStorage.setItem('email', auth.email)
        localStorage.setItem('displayName', auth.displayName)
        setToken(auth.token)
        setEmail(auth.email)
        setDisplayName(auth.displayName)
      },
      logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('email')
        localStorage.removeItem('displayName')
        setToken(null)
        setEmail(null)
        setDisplayName(null)
      },
    }),
    [token, email, displayName],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
