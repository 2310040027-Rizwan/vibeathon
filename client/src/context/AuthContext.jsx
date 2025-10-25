import { createContext, useContext, useEffect, useState } from 'react'
import { login as loginApi, register as registerApi, logout as logoutApi, me as meApi, setAuthToken } from '../services/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) setAuthToken(token)
    meApi()
      .then((res) => setUser(res.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (credentials) => {
    const { user: u, token } = await loginApi(credentials)
    setUser(u)
    if (token) setAuthToken(token)
    return u
  }

  const register = async (payload) => {
    const { user: u, token } = await registerApi(payload)
    setUser(u)
    if (token) setAuthToken(token)
    return u
  }

  const logout = async () => {
    await logoutApi()
    setUser(null)
    setAuthToken(null)
  }

  const value = { user, loading, login, logout, register }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
