import asyncHandler from 'express-async-handler'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import Anthropic from '@anthropic-ai/sdk'
import { HfInference } from '@huggingface/inference'

// Multi-provider AI chatbot controller
export const chat = asyncHandler(async (req, res) => {
  const { message, conversationHistory = [] } = req.body
  if (!message) return res.status(400).json({ message: 'message is required' })

  console.log('🤖 Chatbot request received:', message.substring(0, 50) + '...')

  // Determine which AI provider to use based on available API keys
  const provider = getAvailableProvider()
  console.log('🔧 Using AI provider:', provider)

  if (!provider) {
    return res.status(501).json({
      message: 'Chatbot not configured. Please add one of these to .env: OPENAI_API_KEY, GEMINI_API_KEY, ANTHROPIC_API_KEY, HUGGINGFACE_API_KEY',
      reply: 'Sorry, the chatbot is currently not available. Please try again later or contact an administrator.'
    })
  }

  try {
    const reply = await generateResponse(provider, message, conversationHistory)
    res.json({ reply, provider })
  } catch (error) {
    console.error('❌ Chatbot error:', error)
    res.status(500).json({
      message: 'Chatbot service temporarily unavailable',
      reply: 'I apologize, but I\'m experiencing technical difficulties right now. Please try again in a moment or contact support if the problem persists.'
    })
  }
})

// Determine which AI provider is available
function getAvailableProvider() {
  if (process.env.OPENAI_API_KEY) return 'openai'
  if (process.env.GEMINI_API_KEY) return 'gemini'
  if (process.env.ANTHROPIC_API_KEY) return 'claude'
  if (process.env.HUGGINGFACE_API_KEY) return 'huggingface'
  return null
}

// Generate response based on provider
async function generateResponse(provider, message, conversationHistory) {
  const systemPrompt = getSystemPrompt()

  switch (provider) {
    case 'openai':
      return await generateOpenAIResponse(message, conversationHistory, systemPrompt)
    case 'gemini':
      return await generateGeminiResponse(message, systemPrompt)
    case 'claude':
      return await generateClaudeResponse(message, conversationHistory, systemPrompt)
    case 'huggingface':
      return await generateHuggingFaceResponse(message, systemPrompt)
    default:
      throw new Error('Unsupported AI provider')
  }
}

// OpenAI GPT Response
async function generateOpenAIResponse(message, conversationHistory, systemPrompt) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.slice(-10), // Keep last 10 messages for context
    { role: 'user', content: message }
  ]

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo', // or 'gpt-4' if you have access
    messages,
    max_tokens: 500,
    temperature: 0.7,
  })

  return completion.choices[0].message.content
}

// Gemini Response (existing implementation)
async function generateGeminiResponse(message, systemPrompt) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash', // Using flash for faster responses
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.7,
    }
  })

  const prompt = `${systemPrompt}\n\nUSER QUESTION: ${message}\n\nAnswer the user's question now:`

  const result = await model.generateContent(prompt)
  return result?.response?.text?.() || 'Sorry, I could not generate a response. Please try again!'
}

// Claude Response
async function generateClaudeResponse(message, conversationHistory, systemPrompt) {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  const messages = [
    ...conversationHistory.slice(-10),
    { role: 'user', content: message }
  ]

  const completion = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307', // or 'claude-3-sonnet-20240229' for better quality
    max_tokens: 500,
    temperature: 0.7,
    system: systemPrompt,
    messages,
  })

  return completion.content[0].text
}

// HuggingFace Response (Free tier available)
async function generateHuggingFaceResponse(message, systemPrompt) {
  const hf = new HfInference(process.env.HUGGINGFACE_API_KEY)

  const prompt = `${systemPrompt}\n\nUser: ${message}\n\nAssistant:`

  const response = await hf.textGeneration({
    model: 'microsoft/DialoGPT-medium', // or 'google/flan-t5-base' for more capable model
    inputs: prompt,
    parameters: {
      max_length: 200,
      temperature: 0.7,
      do_sample: true,
    }
  })

  return response.generated_text.replace(prompt, '').trim()
}

// Enhanced system prompt with more details
function getSystemPrompt() {
  return `You are "KLH Buddy" 🤖, an intelligent AI assistant for KLH University's Smart Campus Ecosystem platform.

ABOUT KLH UNIVERSITY:
- Koneru Lakshmaiah Education Foundation (KLEF) - Deemed University
- Located in Vaddeswaram, Guntur, Andhra Pradesh, India
- Established in 1980, granted deemed university status in 2009
- Offers 100+ undergraduate, postgraduate, and doctoral programs
- Strong focus on engineering, technology, management, sciences, and humanities
- State-of-the-art campus spanning 100+ acres with modern infrastructure
- NIRF ranked university with excellent placement records

SMART CAMPUS PLATFORM FEATURES:

1. 📍 LOST & FOUND SYSTEM:
   - Report lost or found items with GPS location tracking and photos
   - Real-time geolocation capture with "Use my location" button
   - Interactive map view showing all items with markers
   - Filter items by status (Lost/Found/Claimed) and location
   - Claim items with photo proof verification and QR code receipts
   - Real-time notifications for item updates

2. 📅 EVENT MANAGEMENT:
   - Students: Submit detailed event requests with categories, capacity, prerequisites
   - Faculty/Admin: Create events directly or approve student requests
   - Enhanced event details: category, capacity, prerequisites, cover images
   - Real-time notifications for approvals/rejections
   - Five tabs: All Events, Request Event, Create Event, Approve Requests, My Requests

3. 💬 FEEDBACK & GRIEVANCE SYSTEM:
   - Submit feedback with categories and anonymous option
   - Faculty/Admin can view, manage, and track feedback status
   - Status tracking: Pending → Reviewed → Resolved
   - Real-time status updates and notifications

4. 🤖 AI CHATBOT (You!):
   - 24/7 campus assistance powered by advanced AI
   - Answer questions about platform features, university info, and more
   - Multiple AI providers supported (OpenAI, Gemini, Claude, HuggingFace)

5. 🔔 REAL-TIME NOTIFICATIONS:
   - Socket.IO powered instant updates
   - Notifications for new lost items, event approvals, feedback updates

USER ROLES & PERMISSIONS:
- 👨‍🎓 Students: Report items, request events, submit feedback, view all public content
- 👨‍🏫 Faculty: Create events, approve requests, manage feedback, moderate content
- 👨‍💼 Admin: Full access to all features, system management, user management

TECHNICAL FEATURES:
- MERN Stack (MongoDB, Express, React, Node.js)
- JWT Authentication with secure 7-day expiry
- Beautiful neon cyberpunk UI with glassmorphism design
- Responsive mobile-first design with dark theme
- GPS/Geolocation integration with interactive maps
- Image upload with base64 encoding and preview
- Real-time Socket.IO updates and notifications

INSTRUCTIONS:
- Be friendly, helpful, and engaging with appropriate emojis
- Provide clear, step-by-step instructions when explaining features
- Keep responses concise but informative (under 200 words)
- If asked about specific university details you don't know, acknowledge and offer general guidance
- Guide users to the correct platform section when relevant
- Maintain conversation context when possible
- If the question is unclear, ask for clarification
- Always promote platform features positively

Remember: You're here to help make campus life easier and more connected! 🎓✨`
}

// Export for testing or direct usage
export { getAvailableProvider, generateResponse }
