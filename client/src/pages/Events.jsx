import { useEffect, useState } from 'react'
import { Box, Button, Card, CardBody, FormControl, FormLabel, Heading, HStack, Input, SimpleGrid, Text, Textarea, useToast, Container, VStack, Tabs, TabList, Tab, TabPanels, TabPanel, Badge, Select, Image, Icon } from '@chakra-ui/react'
import { createEvent, getEvents, deleteEvent } from '../services/events'
import { submitEventRequest, getEventRequests, approveEventRequest, rejectEventRequest, deleteEventRequest } from '../services/eventRequests'
import { useAuth } from '../context/AuthContext.jsx'
import { FiUpload } from 'react-icons/fi'

export default function Events() {
  const toast = useToast()
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [requests, setRequests] = useState([])
  const [form, setForm] = useState({ 
    eventName: '', 
    date: '', 
    time: '', 
    venue: '', 
    description: '', 
    category: 'Other',
    capacity: '',
    prerequisites: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')

  const loadEvents = async () => {
    try {
      const data = await getEvents()
      setEvents(data)
    } catch (err) {
      toast({ title: '❌ Failed to load events', status: 'error', duration: 3000 })
    }
  }

  const loadRequests = async () => {
    try {
      const data = await getEventRequests()
      setRequests(data)
    } catch (err) {
      toast({ title: '❌ Failed to load requests', status: 'error', duration: 3000 })
    }
  }

  useEffect(() => { 
    loadEvents()
    if (user) loadRequests()
  }, [user])

  const canDirectCreate = user && (user.role === 'Faculty' || user.role === 'Admin')
  const canApprove = user && (user.role === 'Faculty' || user.role === 'Admin')
  const isStudent = user && user.role === 'Student'

  const onSubmitRequest = async (e) => {
    e.preventDefault()
    if (!isStudent) return toast({ title: '🔒 Access Denied', description: 'Only students can submit event requests', status: 'warning', duration: 4000 })
    setSubmitting(true)
    try {
      await submitEventRequest(form)
      toast({ title: '✅ Request Submitted', description: 'Your event request is pending approval', status: 'success', duration: 3000 })
      setForm({ eventName: '', date: '', time: '', venue: '', description: '', category: 'Other', capacity: '', prerequisites: '' })
      await loadRequests()
    } catch (err) {
      toast({ title: '❌ Submit Failed', description: err?.response?.data?.message || err.message, status: 'error', duration: 4000 })
    } finally {
      setSubmitting(false)
    }
  }

  const onDirectCreate = async (e) => {
    e.preventDefault()
    if (!canDirectCreate) return toast({ title: '🔒 Access Denied', description: 'Only Faculty and Admins can create events directly', status: 'warning', duration: 4000 })
    setSubmitting(true)
    try {
      await createEvent(form)
      toast({ title: '✅ Event Created', description: 'Your event has been published!', status: 'success', duration: 3000 })
      setForm({ eventName: '', date: '', time: '', venue: '', description: '', category: 'Other', capacity: '', prerequisites: '' })
      await loadEvents()
    } catch (err) {
      toast({ title: '❌ Create Failed', description: err?.response?.data?.message || err.message, status: 'error', duration: 4000 })
    } finally {
      setSubmitting(false)
    }
  }

  const onApprove = async (requestId) => {
    try {
      await approveEventRequest(requestId, reviewNotes)
      toast({ title: '✅ Request Approved', description: 'Event has been created', status: 'success', duration: 3000 })
      setReviewNotes('')
      await loadRequests()
      await loadEvents()
    } catch (err) {
      toast({ title: '❌ Approval Failed', description: err?.response?.data?.message || err.message, status: 'error', duration: 4000 })
    }
  }

  const onReject = async (requestId) => {
    if (!reviewNotes.trim()) {
      return toast({ title: '⚠️ Review notes required', description: 'Please provide a reason for rejection', status: 'warning', duration: 3000 })
    }
    try {
      await rejectEventRequest(requestId, reviewNotes)
      toast({ title: '❌ Request Rejected', status: 'info', duration: 3000 })
      setReviewNotes('')
      await loadRequests()
    } catch (err) {
      toast({ title: '❌ Rejection Failed', status: 'error', duration: 3000 })
    }
  }

  const onDeleteEvent = async (id) => {
    if (!window.confirm('Delete this event?')) return
    try {
      await deleteEvent(id)
      toast({ title: '🗑️ Event Deleted', status: 'info', duration: 2000 })
      await loadEvents()
    } catch (err) {
      toast({ title: '❌ Delete Failed', status: 'error', duration: 3000 })
    }
  }

  const onDeleteRequest = async (id) => {
    if (!window.confirm('Delete this request?')) return
    try {
      await deleteEventRequest(id)
      toast({ title: '🗑️ Request Deleted', status: 'info', duration: 2000 })
      await loadRequests()
    } catch (err) {
      toast({ title: '❌ Delete Failed', status: 'error', duration: 3000 })
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'yellow', label: '⏳ Pending' },
      approved: { color: 'green', label: '✅ Approved' },
      rejected: { color: 'red', label: '❌ Rejected' }
    }
    const config = statusConfig[status] || statusConfig.pending
    return <Badge colorScheme={config.color} fontSize="xs">{config.label}</Badge>
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading 
            size="2xl" 
            bgGradient="linear(to-r, neon.pink, neon.purple)"
            bgClip="text"
            textShadow="0 0 30px rgba(255, 0, 110, 0.6)"
            fontFamily="Orbitron"
          >
            📅 CAMPUS EVENTS
          </Heading>
          <Text color="gray.400" mt={2}>Discover and create amazing campus events</Text>
        </Box>

        <Tabs variant="soft-rounded" colorScheme="pink">
          <TabList bg="rgba(26, 27, 58, 0.5)" p={2} borderRadius="xl">
            <Tab _selected={{ bg: 'neon.pink', color: 'white' }}>📅 All Events</Tab>
            {isStudent && <Tab _selected={{ bg: 'neon.pink', color: 'white' }}>📝 Request Event</Tab>}
            {canDirectCreate && <Tab _selected={{ bg: 'neon.pink', color: 'white' }}>✨ Create Event</Tab>}
            {canApprove && <Tab _selected={{ bg: 'neon.pink', color: 'white' }}>🔍 Approve Requests</Tab>}
            {user && <Tab _selected={{ bg: 'neon.purple', color: 'white' }}>📋 My Requests</Tab>}
          </TabList>

          <TabPanels>
            {/* All Events Tab */}
            <TabPanel>
              {events.length === 0 ? (
                <Box textAlign="center" p={12} bg="rgba(26, 27, 58, 0.5)" borderRadius="xl" border="1px dashed" borderColor="rgba(255, 0, 110, 0.3)">
                  <Text fontSize="4xl" mb={2}>📅</Text>
                  <Text color="gray.400">No upcoming events</Text>
                </Box>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {events.map((ev) => (
                    <Card 
                      key={ev._id}
                      bg="rgba(26, 27, 58, 0.6)"
                      backdropFilter="blur(10px)"
                      borderRadius="xl"
                      border="2px solid"
                      borderColor="rgba(255, 0, 110, 0.3)"
                      boxShadow="0 0 20px rgba(255, 0, 110, 0.2)"
                      transition="all 0.3s ease"
                      _hover={{
                        transform: 'translateY(-4px)',
                        borderColor: 'rgba(255, 0, 110, 0.6)',
                        boxShadow: '0 0 30px rgba(255, 0, 110, 0.4)'
                      }}
                      overflow="hidden"
                    >
                      <CardBody>
                        <VStack align="start" spacing={3}>
                          <HStack justify="space-between" w="full">
                            <Heading size="md" color="white">{ev.eventName || ev.name}</Heading>
                            {ev.category && <Badge colorScheme="purple">{ev.category}</Badge>}
                          </HStack>
                          <HStack spacing={2}>
                            <Text color="neon.pink" fontSize="sm">📅</Text>
                            <Text color="gray.300" fontSize="sm">{ev.date}</Text>
                            {ev.time && (
                              <>
                                <Text color="neon.pink" fontSize="sm">🕒</Text>
                                <Text color="gray.300" fontSize="sm">{ev.time}</Text>
                              </>
                            )}
                          </HStack>
                          {ev.venue && (
                            <HStack spacing={2}>
                              <Text color="neon.pink" fontSize="sm">📍</Text>
                              <Text color="gray.300" fontSize="sm">{ev.venue}</Text>
                            </HStack>
                          )}
                          {ev.capacity && (
                            <HStack spacing={2}>
                              <Text color="neon.cyan" fontSize="sm">👥</Text>
                              <Text color="gray.300" fontSize="sm">Max: {ev.capacity} people</Text>
                            </HStack>
                          )}
                          {ev.description && <Text color="gray.400" fontSize="sm" noOfLines={3}>{ev.description}</Text>}
                          {ev.prerequisites && (
                            <Box p={2} bg="rgba(114, 9, 183, 0.2)" borderRadius="md" w="full">
                              <Text color="neon.purple" fontSize="xs" fontWeight="bold">Prerequisites:</Text>
                              <Text color="gray.300" fontSize="xs">{ev.prerequisites}</Text>
                            </Box>
                          )}
                          {canDirectCreate && (
                            <Button size="sm" variant="outline" onClick={() => onDeleteEvent(ev._id)} w="full" borderColor="rgba(255, 0, 110, 0.5)" color="neon.pink">
                              🗑️ Delete
                            </Button>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              )}
            </TabPanel>

            {/* Student Request Form */}
            {isStudent && (
              <TabPanel>
                <Box
                  as="form"
                  onSubmit={onSubmitRequest}
                  p={6}
                  bg="rgba(26, 27, 58, 0.7)"
                  backdropFilter="blur(20px)"
                  borderRadius="2xl"
                  border="2px solid"
                  borderColor="rgba(255, 0, 110, 0.3)"
                  boxShadow="0 0 40px rgba(255, 0, 110, 0.2)"
                >
                  <Heading size="md" color="neon.pink" mb={4}>✨ Request New Event</Heading>
                  <Text color="gray.400" fontSize="sm" mb={6}>Submit your event idea for Faculty/Admin approval</Text>
                  <VStack spacing={4} align="stretch">
                    <HStack spacing={4}>
                      <FormControl isRequired flex={2}>
                        <FormLabel color="neon.pink" fontWeight="bold">Event Name</FormLabel>
                        <Input 
                          value={form.eventName} 
                          onChange={(e) => setForm({ ...form, eventName: e.target.value })}
                          placeholder="e.g., Tech Fest 2025"
                        />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel color="neon.pink" fontWeight="bold">Category</FormLabel>
                        <Select 
                          value={form.category} 
                          onChange={(e) => setForm({ ...form, category: e.target.value })}
                          bg="rgba(26, 27, 58, 0.8)"
                        >
                          <option value="Technical" style={{background: '#1a1b3a'}}>Technical</option>
                          <option value="Cultural" style={{background: '#1a1b3a'}}>Cultural</option>
                          <option value="Sports" style={{background: '#1a1b3a'}}>Sports</option>
                          <option value="Workshop" style={{background: '#1a1b3a'}}>Workshop</option>
                          <option value="Seminar" style={{background: '#1a1b3a'}}>Seminar</option>
                          <option value="Other" style={{background: '#1a1b3a'}}>Other</option>
                        </Select>
                      </FormControl>
                    </HStack>
                    <HStack spacing={4}>
                      <FormControl isRequired>
                        <FormLabel color="neon.pink" fontWeight="bold">Date</FormLabel>
                        <Input 
                          type="date"
                          inputMode="numeric"
                          pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
                          value={form.date} 
                          onChange={(e) => setForm({ ...form, date: e.target.value })}
                          size="lg"
                          bg="rgba(26, 27, 58, 0.9)"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel color="neon.pink" fontWeight="bold">Time</FormLabel>
                        <Input 
                          type="time"
                          inputMode="numeric"
                          pattern="[0-9]{2}:[0-9]{2}"
                          value={form.time} 
                          onChange={(e) => setForm({ ...form, time: e.target.value })}
                          size="lg"
                          bg="rgba(26, 27, 58, 0.9)"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel color="neon.pink" fontWeight="bold">Venue</FormLabel>
                        <Input 
                          value={form.venue} 
                          onChange={(e) => setForm({ ...form, venue: e.target.value })}
                          placeholder="e.g., Main Auditorium"
                          size="lg"
                        />
                      </FormControl>
                    </HStack>
                    <HStack spacing={4}>
                      <FormControl>
                        <FormLabel color="neon.pink" fontWeight="bold">Max Capacity</FormLabel>
                        <Input 
                          type="number"
                          value={form.capacity} 
                          onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                          placeholder="e.g., 200"
                          size="lg"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel color="neon.pink" fontWeight="bold">Prerequisites</FormLabel>
                        <Input 
                          value={form.prerequisites} 
                          onChange={(e) => setForm({ ...form, prerequisites: e.target.value })}
                          placeholder="e.g., Bring laptop"
                          size="lg"
                        />
                      </FormControl>
                    </HStack>
                    <FormControl>
                      <FormLabel color="neon.pink" fontWeight="bold">Description</FormLabel>
                      <Textarea 
                        value={form.description} 
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={3}
                        placeholder="Describe the event..."
                      />
                    </FormControl>
                    <Button type="submit" isLoading={submitting} variant="neonPink" size="lg">
                      📨 Submit Request
                    </Button>
                  </VStack>
                </Box>
              </TabPanel>
            )}

            {/* Faculty/Admin Direct Create Form */}
            {canDirectCreate && (
              <TabPanel>
                <Box
                  as="form"
                  onSubmit={onDirectCreate}
                  p={6}
                  bg="rgba(26, 27, 58, 0.7)"
                  backdropFilter="blur(20px)"
                  borderRadius="2xl"
                  border="2px solid"
                  borderColor="rgba(0, 255, 255, 0.3)"
                  boxShadow="0 0 40px rgba(0, 255, 255, 0.2)"
                >
                  <Heading size="md" color="neon.cyan" mb={4}>✨ Create Event Directly</Heading>
                  <Text color="gray.400" fontSize="sm" mb={6}>As Faculty/Admin, you can publish events immediately</Text>
                  <VStack spacing={4} align="stretch">
                    <HStack spacing={4}>
                      <FormControl isRequired flex={2}>
                        <FormLabel color="neon.cyan" fontWeight="bold">Event Name</FormLabel>
                        <Input 
                          value={form.eventName} 
                          onChange={(e) => setForm({ ...form, eventName: e.target.value })}
                          placeholder="e.g., Annual Sports Meet"
                        />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel color="neon.cyan" fontWeight="bold">Category</FormLabel>
                        <Select 
                          value={form.category} 
                          onChange={(e) => setForm({ ...form, category: e.target.value })}
                          bg="rgba(26, 27, 58, 0.8)"
                        >
                          <option value="Technical" style={{background: '#1a1b3a'}}>Technical</option>
                          <option value="Cultural" style={{background: '#1a1b3a'}}>Cultural</option>
                          <option value="Sports" style={{background: '#1a1b3a'}}>Sports</option>
                          <option value="Workshop" style={{background: '#1a1b3a'}}>Workshop</option>
                          <option value="Seminar" style={{background: '#1a1b3a'}}>Seminar</option>
                          <option value="Other" style={{background: '#1a1b3a'}}>Other</option>
                        </Select>
                      </FormControl>
                    </HStack>
                    <HStack spacing={4}>
                      <FormControl isRequired>
                        <FormLabel color="neon.cyan" fontWeight="bold">Date</FormLabel>
                        <Input 
                          type="date"
                          value={form.date} 
                          onChange={(e) => setForm({ ...form, date: e.target.value })}
                          size="lg"
                          bg="rgba(26, 27, 58, 0.9)"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel color="neon.cyan" fontWeight="bold">Time</FormLabel>
                        <Input 
                          type="time"
                          value={form.time} 
                          onChange={(e) => setForm({ ...form, time: e.target.value })}
                          size="lg"
                          bg="rgba(26, 27, 58, 0.9)"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel color="neon.cyan" fontWeight="bold">Venue</FormLabel>
                        <Input 
                          value={form.venue} 
                          onChange={(e) => setForm({ ...form, venue: e.target.value })}
                          placeholder="e.g., Sports Complex"
                          size="lg"
                        />
                      </FormControl>
                    </HStack>
                    <HStack spacing={4}>
                      <FormControl>
                        <FormLabel color="neon.cyan" fontWeight="bold">Max Capacity</FormLabel>
                        <Input 
                          type="number"
                          value={form.capacity} 
                          onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                          placeholder="e.g., 500"
                          size="lg"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel color="neon.cyan" fontWeight="bold">Prerequisites</FormLabel>
                        <Input 
                          value={form.prerequisites} 
                          onChange={(e) => setForm({ ...form, prerequisites: e.target.value })}
                          placeholder="e.g., Bring laptop"
                          size="lg"
                        />
                      </FormControl>
                    </HStack>
                    <FormControl>
                      <FormLabel color="neon.cyan" fontWeight="bold">Description</FormLabel>
                      <Textarea 
                        value={form.description} 
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={3}
                        size="lg"
                      />
                    </FormControl>
                    <Button type="submit" isLoading={submitting} variant="neon" size="lg">
                      🚀 Create Event
                    </Button>
                  </VStack>
                </Box>
              </TabPanel>
            )}

            {/* Approval Dashboard for Faculty/Admin */}
            {canApprove && (
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <Heading size="md" color="neon.purple">🔍 Pending Event Requests</Heading>
                  {requests.filter(r => r.status === 'pending').length === 0 ? (
                    <Box textAlign="center" p={8} bg="rgba(26, 27, 58, 0.5)" borderRadius="xl">
                      <Text color="gray.400">No pending requests</Text>
                    </Box>
                  ) : (
                    requests.filter(r => r.status === 'pending').map((req) => (
                      <Card 
                        key={req._id}
                        bg="rgba(26, 27, 58, 0.7)"
                        backdropFilter="blur(10px)"
                        borderRadius="xl"
                        border="2px solid"
                        borderColor="rgba(114, 9, 183, 0.4)"
                        boxShadow="0 0 20px rgba(114, 9, 183, 0.3)"
                      >
                        <CardBody>
                          <VStack align="stretch" spacing={4}>
                            <HStack justify="space-between">
                              <Heading size="sm" color="white">{req.eventName}</Heading>
                              {getStatusBadge(req.status)}
                            </HStack>
                            <SimpleGrid columns={2} spacing={3}>
                              <Box>
                                <Text color="neon.purple" fontSize="xs" fontWeight="bold">Requested By:</Text>
                                <Text color="gray.300" fontSize="sm">{req.requestedBy?.name} ({req.requestedBy?.email})</Text>
                              </Box>
                              <Box>
                                <Text color="neon.purple" fontSize="xs" fontWeight="bold">Category:</Text>
                                <Text color="gray.300" fontSize="sm">{req.category}</Text>
                              </Box>
                              <Box>
                                <Text color="neon.purple" fontSize="xs" fontWeight="bold">Date & Time:</Text>
                                <Text color="gray.300" fontSize="sm">{req.date} {req.time && `at ${req.time}`}</Text>
                              </Box>
                              <Box>
                                <Text color="neon.purple" fontSize="xs" fontWeight="bold">Venue:</Text>
                                <Text color="gray.300" fontSize="sm">{req.venue || 'TBD'}</Text>
                              </Box>
                              {req.capacity && (
                                <Box>
                                  <Text color="neon.purple" fontSize="xs" fontWeight="bold">Capacity:</Text>
                                  <Text color="gray.300" fontSize="sm">{req.capacity} people</Text>
                                </Box>
                              )}
                            </SimpleGrid>
                            {req.description && (
                              <Box>
                                <Text color="neon.purple" fontSize="xs" fontWeight="bold">Description:</Text>
                                <Text color="gray.300" fontSize="sm">{req.description}</Text>
                              </Box>
                            )}
                            {req.prerequisites && (
                              <Box>
                                <Text color="neon.purple" fontSize="xs" fontWeight="bold">Prerequisites:</Text>
                                <Text color="gray.300" fontSize="sm">{req.prerequisites}</Text>
                              </Box>
                            )}
                            <FormControl>
                              <FormLabel color="neon.purple" fontSize="sm">Review Notes:</FormLabel>
                              <Textarea 
                                value={reviewNotes} 
                                onChange={(e) => setReviewNotes(e.target.value)}
                                placeholder="Add your comments..."
                                size="sm"
                                rows={2}
                              />
                            </FormControl>
                            <HStack spacing={3}>
                              <Button 
                                variant="solid" 
                                colorScheme="green" 
                                flex={1}
                                onClick={() => onApprove(req._id)}
                              >
                                ✅ Approve
                              </Button>
                              <Button 
                                variant="solid" 
                                colorScheme="red" 
                                flex={1}
                                onClick={() => onReject(req._id)}
                              >
                                ❌ Reject
                              </Button>
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))
                  )}
                </VStack>
              </TabPanel>
            )}

            {/* My Requests Tab */}
            {user && (
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <Heading size="md" color="neon.purple">📋 My Event Requests</Heading>
                  {requests.length === 0 ? (
                    <Box textAlign="center" p={8} bg="rgba(26, 27, 58, 0.5)" borderRadius="xl">
                      <Text color="gray.400">No requests yet</Text>
                    </Box>
                  ) : (
                    requests.map((req) => (
                      <Card 
                        key={req._id}
                        bg="rgba(26, 27, 58, 0.6)"
                        backdropFilter="blur(10px)"
                        borderRadius="xl"
                        border="2px solid"
                        borderColor={req.status === 'approved' ? 'rgba(6, 255, 165, 0.4)' : req.status === 'rejected' ? 'rgba(255, 0, 110, 0.4)' : 'rgba(255, 190, 11, 0.4)'}
                        boxShadow={`0 0 20px ${req.status === 'approved' ? 'rgba(6, 255, 165, 0.2)' : req.status === 'rejected' ? 'rgba(255, 0, 110, 0.2)' : 'rgba(255, 190, 11, 0.2)'}`}
                      >
                        <CardBody>
                          <VStack align="stretch" spacing={3}>
                            <HStack justify="space-between">
                              <Heading size="sm" color="white">{req.eventName}</Heading>
                              {getStatusBadge(req.status)}
                            </HStack>
                            <HStack spacing={4}>
                              <Text color="gray.400" fontSize="sm">📅 {req.date}</Text>
                              {req.time && <Text color="gray.400" fontSize="sm">🕒 {req.time}</Text>}
                              {req.venue && <Text color="gray.400" fontSize="sm">📍 {req.venue}</Text>}
                            </HStack>
                            {req.reviewNotes && (
                              <Box p={3} bg="rgba(114, 9, 183, 0.2)" borderRadius="md">
                                <Text color="neon.purple" fontSize="xs" fontWeight="bold">Review Notes:</Text>
                                <Text color="gray.300" fontSize="sm">{req.reviewNotes}</Text>
                              </Box>
                            )}
                            {req.reviewedBy && (
                              <Text color="gray.500" fontSize="xs">
                                Reviewed by {req.reviewedBy.name} on {new Date(req.reviewedAt).toLocaleDateString()}
                              </Text>
                            )}
                            {req.status === 'pending' && isStudent && (
                              <Button size="sm" variant="outline" onClick={() => onDeleteRequest(req._id)} borderColor="rgba(255, 0, 110, 0.5)" color="neon.pink">
                                🗑️ Delete Request
                              </Button>
                            )}
                          </VStack>
                        </CardBody>
                      </Card>
                    ))
                  )}
                </VStack>
              </TabPanel>
            )}
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  )
}
