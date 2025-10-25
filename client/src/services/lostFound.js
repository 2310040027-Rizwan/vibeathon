import api from './api'

export async function reportItem(payload) {
  const res = await api.post('/api/lost-found/report', payload)
  return res.data
}

export async function getItems() {
  const res = await api.get('/api/lost-found')
  return res.data
}

export async function updateItem(id, payload) {
  const res = await api.put(`/api/lost-found/${id}`, payload)
  return res.data
}
