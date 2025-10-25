import { useState, useEffect, useRef } from 'react'
import { Box, Button, HStack, Input, Stack, Text, useToast, Heading, VStack, IconButton, Badge, Spinner } from '@chakra-ui/react'
import { DeleteIcon } from '@chakra-ui/icons'
import { askChatbot, getChatbotStatus, clearChatHistory } from '../../services/chatbot'

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ role: 'bot', text: 'Hi! I am KLH Buddy 🤖 Ask me about the campus!' }])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [chatbotStatus, setChatbotStatus] = useState({ available: false, provider: 'none' })
  const [loadingStatus, setLoadingStatus] = useState(true)
  const messagesEndRef = useRef(null)
  const toast = useToast()

  // Load chatbot status on mount
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const status = await getChatbotStatus()
        setChatbotStatus(status)
      } catch (error) {
        console.error('Failed to load chatbot status:', error)
      } finally {
        setLoadingStatus(false)
      }
    }
    loadStatus()
  }, [])

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const text = draft.trim()
    if (!text) return

    if (!chatbotStatus.available) {
      toast({
        title: '🤖 Chatbot Unavailable',
        description: 'The chatbot is currently not configured. Please contact an administrator.',
        status: 'warning',
        duration: 3000,
      })
      return
    }

    setDraft('')
    const userMessage = { role: 'user', text, timestamp: new Date() }
    setMessages((m) => [...m, userMessage])

    setSending(true)
    try {
      // Convert messages to conversation history format
      const conversationHistory = messages
        .filter(m => m.role !== 'bot' || m.text !== 'Hi! I am KLH Buddy 🤖 Ask me about the campus!')
        .slice(-10) // Keep last 10 messages for context
        .map(m => ({ role: m.role, content: m.text }))

      const res = await askChatbot(text, conversationHistory)
      const botMessage = {
        role: 'bot',
        text: res.reply,
        provider: res.provider,
        timestamp: new Date()
      }
      setMessages((m) => [...m, botMessage])
    } catch (err) {
      const errorMessage = {
        role: 'bot',
        text: 'I apologize, but I\'m experiencing technical difficulties right now. Please try again in a moment! 😅',
        isError: true,
        timestamp: new Date()
      }
      setMessages((m) => [...m, errorMessage])

      toast({
        title: '❌ Chatbot Error',
        description: 'Failed to get response. The service may be temporarily unavailable.',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setSending(false)
    }
  }

  const clearHistory = async () => {
    try {
      await clearChatHistory()
      setMessages([{ role: 'bot', text: 'Hi! I am KLH Buddy 🤖 Ask me about the campus!' }])
      toast({
        title: '🧹 Chat Cleared',
        description: 'Conversation history has been cleared.',
        status: 'success',
        duration: 2000,
      })
    } catch (error) {
      toast({
        title: '❌ Clear Failed',
        description: 'Failed to clear chat history. Please try again.',
        status: 'error',
        duration: 2000,
      })
    }
  }

  const getProviderIcon = (provider) => {
    switch (provider) {
      case 'openai': return '🤖'
      case 'gemini': return '🌟'
      case 'claude': return '🧠'
      case 'huggingface': return '🤗'
      default: return '💬'
    }
  }

  const getProviderColor = (provider) => {
    switch (provider) {
      case 'openai': return 'blue'
      case 'gemini': return 'purple'
      case 'claude': return 'orange'
      case 'huggingface': return 'green'
      default: return 'gray'
    }
  }

  return (
    <>
      <Button
        position="fixed"
        right={6}
        bottom={6}
        variant="neon"
        size="lg"
        onClick={() => setOpen((o) => !o)}
        boxShadow="0 0 30px rgba(0, 255, 255, 0.5)"
        zIndex={1001}
        isDisabled={loadingStatus}
      >
        {loadingStatus ? (
          <Spinner size="sm" color="neon.cyan" />
        ) : open ? (
          '❌ Close Chat'
        ) : (
          <>
            🤖 KLH Buddy
            {chatbotStatus.available && (
              <Badge ml={2} colorScheme={getProviderColor(chatbotStatus.provider)} size="sm">
                {getProviderIcon(chatbotStatus.provider)} {chatbotStatus.provider}
              </Badge>
            )}
          </>
        )}
      </Button>

      {open && (
        <Box
          position="fixed"
          right={6}
          bottom={24}
          w={{ base: '90vw', md: '420px' }}
          h="550px"
          bg="rgba(10, 14, 39, 0.95)"
          backdropFilter="blur(20px)"
          borderWidth="2px"
          borderColor="rgba(0, 255, 255, 0.5)"
          borderRadius="2xl"
          p={4}
          boxShadow="0 0 50px rgba(0, 255, 255, 0.4)"
          zIndex={1001}
        >
          <Stack spacing={3} h="100%">
            <HStack justify="space-between" align="center">
              <Heading
                size="md"
                color="neon.cyan"
                textAlign="center"
                textShadow="0 0 15px rgba(0, 255, 255, 0.8)"
              >
                🤖 KLH BUDDY
              </Heading>
              <HStack>
                {chatbotStatus.available && (
                  <Badge colorScheme={getProviderColor(chatbotStatus.provider)} size="sm">
                    {getProviderIcon(chatbotStatus.provider)} {chatbotStatus.provider.toUpperCase()}
                  </Badge>
                )}
                <IconButton
                  icon={<DeleteIcon />}
                  size="sm"
                  variant="ghost"
                  color="neon.pink"
                  onClick={clearHistory}
                  title="Clear chat history"
                />
              </HStack>
            </HStack>

            {!chatbotStatus.available && !loadingStatus && (
              <Box p={3} bg="rgba(255, 0, 110, 0.1)" borderRadius="md" border="1px solid" borderColor="neon.pink">
                <Text color="neon.pink" fontSize="sm" textAlign="center">
                  🤖 Chatbot is currently not configured.
                  <br />
                  Please add an AI API key to enable this feature.
                </Text>
              </Box>
            )}

            <Box
              flex={1}
              overflowY="auto"
              pr={2}
              css={{
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(0, 255, 255, 0.1)',
                  borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(0, 255, 255, 0.5)',
                  borderRadius: '10px',
                },
              }}
            >
              {messages.map((m, idx) => (
                <Box key={idx} textAlign={m.role === 'user' ? 'right' : 'left'} mb={3}>
                  <VStack align={m.role === 'user' ? 'flex-end' : 'flex-start'} spacing={1}>
                    {m.provider && m.role === 'bot' && (
                      <Badge size="xs" colorScheme={getProviderColor(m.provider)} opacity={0.7}>
                        {getProviderIcon(m.provider)} {m.provider}
                      </Badge>
                    )}
                    <Text
                      display="inline-block"
                      bg={m.role === 'user'
                        ? 'linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(0, 255, 255, 0.1))'
                        : m.isError
                        ? 'linear-gradient(135deg, rgba(255, 0, 110, 0.2), rgba(255, 0, 110, 0.1))'
                        : 'linear-gradient(135deg, rgba(255, 0, 110, 0.2), rgba(255, 0, 110, 0.1))'
                      }
                      border="1px solid"
                      borderColor={m.role === 'user'
                        ? 'rgba(0, 255, 255, 0.4)'
                        : m.isError
                        ? 'rgba(255, 0, 110, 0.6)'
                        : 'rgba(255, 0, 110, 0.4)'
                      }
                      color="white"
                      px={4}
                      py={3}
                      borderRadius="lg"
                      maxW="85%"
                      boxShadow={m.role === 'user'
                        ? '0 0 15px rgba(0, 255, 255, 0.2)'
                        : m.isError
                        ? '0 0 15px rgba(255, 0, 110, 0.4)'
                        : '0 0 15px rgba(255, 0, 110, 0.2)'
                      }
                      fontSize="sm"
                    >
                      {m.text}
                    </Text>
                    {m.timestamp && (
                      <Text fontSize="xs" color="gray.400" opacity={0.6}>
                        {m.timestamp.toLocaleTimeString()}
                      </Text>
                    )}
                  </VStack>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Box>

            <HStack>
              <Input
                placeholder={chatbotStatus.available ? "Ask me anything about campus..." : "Chatbot not available"}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !sending ? send() : null}
                size="md"
                isDisabled={!chatbotStatus.available || sending}
              />
              <Button
                onClick={send}
                isLoading={sending}
                variant="neon"
                minW="80px"
                isDisabled={!chatbotStatus.available || !draft.trim()}
              >
                Send
              </Button>
            </HStack>
          </Stack>
        </Box>
      )}
    </>
  )
}
