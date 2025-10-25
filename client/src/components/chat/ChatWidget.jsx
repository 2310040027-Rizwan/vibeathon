import { useState } from 'react'
import { Box, Button, HStack, Input, Stack, Text, useToast, Heading } from '@chakra-ui/react'
import { askChatbot } from '../../services/chatbot'

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ role: 'bot', text: 'Hi! I am KLH Buddy 🤖 Ask me about the campus!' }])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const toast = useToast()

  const send = async () => {
    const text = draft.trim()
    if (!text) return
    setDraft('')
    setMessages((m) => [...m, { role: 'user', text }])
    setSending(true)
    try {
      const res = await askChatbot(text)
      setMessages((m) => [...m, { role: 'bot', text: res.reply }])
    } catch (err) {
      toast({ 
        title: '❌ Chatbot Error', 
        description: 'Failed to get response. Try again!',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setSending(false)
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
      >
        {open ? '❌ Close Chat' : '🤖 KLH Buddy'}
      </Button>
      {open && (
        <Box 
          position="fixed" 
          right={6} 
          bottom={24} 
          w={{ base: '90vw', md: '400px' }} 
          h="500px" 
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
            <Heading 
              size="md" 
              color="neon.cyan"
              textAlign="center"
              textShadow="0 0 15px rgba(0, 255, 255, 0.8)"
            >
              🤖 KLH BUDDY
            </Heading>
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
                  <Text 
                    display="inline-block" 
                    bg={m.role === 'user' 
                      ? 'linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(0, 255, 255, 0.1))' 
                      : 'linear-gradient(135deg, rgba(255, 0, 110, 0.2), rgba(255, 0, 110, 0.1))'
                    }
                    border="1px solid"
                    borderColor={m.role === 'user' ? 'rgba(0, 255, 255, 0.4)' : 'rgba(255, 0, 110, 0.4)'}
                    color="white"
                    px={4} 
                    py={3} 
                    borderRadius="lg" 
                    maxW="85%"
                    boxShadow={m.role === 'user' 
                      ? '0 0 15px rgba(0, 255, 255, 0.2)' 
                      : '0 0 15px rgba(255, 0, 110, 0.2)'
                    }
                    fontSize="sm"
                  >
                    {m.text}
                  </Text>
                </Box>
              ))}
            </Box>
            <HStack>
              <Input 
                placeholder="Ask me anything..." 
                value={draft} 
                onChange={(e) => setDraft(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' ? send() : null}
                size="md"
              />
              <Button 
                onClick={send} 
                isLoading={sending} 
                variant="neon"
                minW="80px"
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
