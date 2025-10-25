import api from './api'

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    localStorage.setItem('token', token)
  } else {
    delete api.defaults.headers.common['Authorization']
    localStorage.removeItem('token')
  }
}

export async function register(data) {
  const res = await api.post('/api/auth/register', data)
  if (res.data?.token) setAuthToken(res.data.token)
  return res.data
}

export async function login(data) {
  const res = await api.post('/api/auth/login', data)
  if (res.data?.token) setAuthToken(res.data.token)
  return res.data
}

export async function logout() {
  await api.post('/api/auth/logout')
  setAuthToken(null)
}

export async function me() {
  const res = await api.get('/api/auth/me')
  return res.data
}
