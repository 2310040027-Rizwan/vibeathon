import api from './api'

export async function askChatbot(message) {
  const res = await api.post('/api/chatbot', { message })
  return res.data
}
