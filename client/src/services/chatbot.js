import api from './api'

// Enhanced chatbot service with conversation history
export async function askChatbot(message, conversationHistory = []) {
  const res = await api.post('/api/chatbot', { message, conversationHistory })
  return res.data
}

// Get chatbot status and available providers
export async function getChatbotStatus() {
  try {
    const res = await api.get('/api/chatbot/status')
    return res.data
  } catch (error) {
    return { available: false, error: error.response?.data?.message || 'Chatbot unavailable' }
  }
}

// Clear conversation history
export async function clearChatHistory() {
  try {
    const res = await api.delete('/api/chatbot/history')
    return res.data
  } catch (error) {
    console.error('Failed to clear chat history:', error)
    return { success: false }
  }
}
