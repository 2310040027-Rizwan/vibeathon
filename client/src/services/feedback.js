import api from './api'

export async function submitFeedback(payload) {
  const res = await api.post('/api/feedback', payload)
  return res.data
}

export async function listFeedback() {
  const res = await api.get('/api/feedback')
  return res.data
}

export async function setFeedbackStatus(id, status) {
  const res = await api.put(`/api/feedback/${id}`, { status })
  return res.data
}
