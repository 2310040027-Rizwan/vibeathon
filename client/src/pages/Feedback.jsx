import { useEffect, useState } from 'react'
import { Box, Button, Card, CardBody, FormControl, FormLabel, Heading, HStack, Input, Select, SimpleGrid, Stack, Text, Textarea, useToast, Tag, Container, VStack, Badge } from '@chakra-ui/react'
import { submitFeedback, listFeedback, setFeedbackStatus } from '../services/feedback'
import { useAuth } from '../context/AuthContext.jsx'

export default function Feedback() {
  const toast = useToast()
  const { user } = useAuth()
  const [form, setForm] = useState({ subject: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [all, setAll] = useState([])

  const isAdmin = user?.role === 'Admin'

  const load = async () => {
    if (!isAdmin) return
    try {
      const data = await listFeedback()
      setAll(data)
    } catch (err) {
      toast({ title: '❌ Failed to load feedback', status: 'error', duration: 3000 })
    }
  }

  useEffect(() => { load() }, [isAdmin])

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!user) return toast({ title: '🔒 Login required', description: 'Please login to submit feedback', status: 'warning', duration: 3000 })
    setSubmitting(true)
    try {
      await submitFeedback(form)
      toast({ title: '✅ Feedback Submitted', description: 'Thank you for your feedback!', status: 'success', duration: 3000 })
      setForm({ subject: '', message: '' })
      await load()
    } catch (err) {
      toast({ title: '❌ Submit Failed', description: err?.response?.data?.message || err.message, status: 'error', duration: 4000 })
    } finally {
      setSubmitting(false)
    }
  }

  const onSetStatus = async (id, status) => {
    try {
      await setFeedbackStatus(id, status)
      toast({ title: '✅ Status Updated', status: 'success', duration: 2000 })
      await load()
    } catch (err) {
      toast({ title: '❌ Update Failed', status: 'error', duration: 3000 })
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'neon.yellow'
      case 'resolved': return 'neon.green'
      default: return 'neon.cyan'
    }
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading 
            size="2xl" 
            bgGradient="linear(to-r, neon.purple, neon.pink)"
            bgClip="text"
            textShadow="0 0 30px rgba(114, 9, 183, 0.6)"
            fontFamily="Orbitron"
          >
            💬 FEEDBACK & GRIEVANCE
          </Heading>
          <Text color="gray.400" mt={2}>Share your thoughts and concerns with us</Text>
        </Box>

        <Box
          as="form"
          onSubmit={onSubmit}
          p={6}
          bg="rgba(26, 27, 58, 0.7)"
          backdropFilter="blur(20px)"
          borderRadius="2xl"
          border="2px solid"
          borderColor="rgba(114, 9, 183, 0.3)"
          boxShadow="0 0 40px rgba(114, 9, 183, 0.2)"
        >
          <Heading size="md" color="neon.purple" mb={4}>📝 Submit Feedback</Heading>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel color="neon.purple" fontWeight="bold">Subject</FormLabel>
              <Input 
                value={form.subject} 
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Brief topic of your feedback"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel color="neon.purple" fontWeight="bold">Message</FormLabel>
              <Textarea 
                value={form.message} 
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Share your detailed feedback or grievance..."
                rows={5}
              />
            </FormControl>
            <Button 
              type="submit" 
              isLoading={submitting}
              size="lg"
              bg="transparent"
              border="2px solid"
              borderColor="neon.purple"
              color="neon.purple"
              textShadow="0 0 10px rgba(114, 9, 183, 0.8)"
              boxShadow="0 0 10px rgba(114, 9, 183, 0.3)"
              _hover={{
                bg: 'neon.purple',
                color: 'white',
                boxShadow: '0 0 30px rgba(114, 9, 183, 0.8)',
              }}
            >
              🚀 Submit Feedback
            </Button>
          </VStack>
        </Box>

  {isAdmin && (
          <>
            <Box textAlign="center" mt={6}>
              <Heading 
                size="lg" 
                color="neon.pink"
                textShadow="0 0 20px rgba(255, 0, 110, 0.6)"
              >
                📊 All Submissions (Admin View)
              </Heading>
            </Box>
            
            {all.length === 0 ? (
              <Box 
                textAlign="center" 
                p={12}
                bg="rgba(26, 27, 58, 0.5)"
                borderRadius="xl"
                border="1px dashed"
                borderColor="rgba(114, 9, 183, 0.3)"
              >
                <Text fontSize="4xl" mb={2}>📭</Text>
                <Text color="gray.400">No feedback submissions yet</Text>
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {all.map((fb) => (
                  <Card 
                    key={fb._id}
                    bg="rgba(26, 27, 58, 0.6)"
                    backdropFilter="blur(10px)"
                    borderRadius="xl"
                    border="2px solid"
                    borderColor="rgba(114, 9, 183, 0.3)"
                    boxShadow="0 0 20px rgba(114, 9, 183, 0.2)"
                    transition="all 0.3s ease"
                    _hover={{
                      borderColor: 'neon.purple',
                      boxShadow: '0 0 30px rgba(114, 9, 183, 0.4)',
                      transform: 'translateY(-2px)'
                    }}
                  >
                    <CardBody>
                      <HStack justify="space-between" mb={3}>
                        <Heading size="sm" color="neon.cyan">{fb.subject}</Heading>
                        <Badge
                          px={3}
                          py={1}
                          borderRadius="full"
                          bg="transparent"
                          border="1px solid"
                          borderColor={getStatusColor(fb.status)}
                          color={getStatusColor(fb.status)}
                          textTransform="uppercase"
                          fontSize="xs"
                        >
                          {fb.status}
                        </Badge>
                      </HStack>
                      <Text color="gray.300" mb={3}>{fb.message}</Text>
                      {fb.submittedBy && (
                        <Text fontSize="sm" color="gray.500" mb={3}>
                          👤 By: {fb.submittedBy.name} ({fb.submittedBy.email})
                        </Text>
                      )}
                      <HStack spacing={2}>
                        {fb.status !== 'pending' && (
                          <Button 
                            size="sm"
                            variant="outline"
                            borderColor="neon.yellow"
                            color="neon.yellow"
                            _hover={{ bg: 'rgba(255, 190, 11, 0.1)' }}
                            onClick={() => onSetStatus(fb._id, 'pending')}
                          >
                            ⏳ Pending
                          </Button>
                        )}
                        {fb.status !== 'resolved' && (
                          <Button 
                            size="sm"
                            variant="outline"
                            borderColor="neon.green"
                            color="neon.green"
                            _hover={{ bg: 'rgba(6, 255, 165, 0.1)' }}
                            onClick={() => onSetStatus(fb._id, 'resolved')}
                          >
                            ✅ Resolve
                          </Button>
                        )}
                      </HStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </>
        )}
      </VStack>
    </Container>
  )
}

