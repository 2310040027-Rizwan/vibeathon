import api from './api'

export const submitEventRequest = async (requestData) => {
  const { data } = await api.post('/api/event-requests', requestData)
  return data
}

export const getEventRequests = async (status = null) => {
  const params = status ? { status } : {}
  const { data } = await api.get('/api/event-requests', { params })
  return data
}

export const approveEventRequest = async (requestId, reviewNotes = '') => {
  const { data } = await api.put(`/api/event-requests/${requestId}/approve`, { reviewNotes })
  return data
}

export const rejectEventRequest = async (requestId, reviewNotes = '') => {
  const { data } = await api.put(`/api/event-requests/${requestId}/reject`, { reviewNotes })
  return data
}

export const deleteEventRequest = async (requestId) => {
  const { data } = await api.delete(`/api/event-requests/${requestId}`)
  return data
}
