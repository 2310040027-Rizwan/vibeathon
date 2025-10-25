import api from './api'

export async function createEvent(payload) {
  const res = await api.post('/api/events', payload)
  return res.data
}

export async function getEvents() {
  const res = await api.get('/api/events')
  return res.data
}

export async function updateEvent(id, payload) {
  const res = await api.put(`/api/events/${id}`, payload)
  return res.data
}

export async function deleteEvent(id) {
  const res = await api.delete(`/api/events/${id}`)
  return res.data
}
