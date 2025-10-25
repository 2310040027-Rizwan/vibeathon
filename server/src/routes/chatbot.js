import { Router } from 'express'
import { chat, getAvailableProvider } from '../controllers/chatbotController.js'

const router = Router()

// Main chat endpoint
router.post('/', chat)

// Get chatbot status and available providers
router.get('/status', (req, res) => {
  const provider = getAvailableProvider()
  res.json({
    available: !!provider,
    provider: provider || 'none',
    providers: {
      openai: !!process.env.OPENAI_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY,
      claude: !!process.env.ANTHROPIC_API_KEY,
      huggingface: !!process.env.HUGGINGFACE_API_KEY,
    }
  })
})

export default router
