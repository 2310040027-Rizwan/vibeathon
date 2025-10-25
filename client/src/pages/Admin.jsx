import { useEffect, useState } from 'react'
import { Box, Heading, Text, Container, VStack, SimpleGrid, Card, CardBody, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, useToast, Button, HStack, Badge } from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'
import { getEvents } from '../services/events'
import { getItems } from '../services/lostFound'
import { getEventRequests } from '../services/eventRequests'

export default function Admin() {
  const { user } = useAuth()
  const toast = useToast()
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    lostItems: 0,
    foundItems: 0,
    pendingRequests: 0,
  })

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [events, lostFoundItems, eventRequests] = await Promise.all([
          getEvents(),
          getItems(),
          getEventRequests().catch(() => []),
        ])

        const today = new Date().toISOString().split('T')[0]
        const upcoming = events.filter(e => e.date >= today).length
        const lost = lostFoundItems.filter(i => i.status === 'lost').length
        const found = lostFoundItems.filter(i => i.status === 'found').length
        const pending = eventRequests.filter(r => r.status === 'pending').length

        setStats({
          totalEvents: events.length,
          upcomingEvents: upcoming,
          lostItems: lost,
          foundItems: found,
          pendingRequests: pending,
        })
      } catch (error) {
        console.error('Failed to load admin stats:', error)
      }
    }

    if (user) loadStats()
  }, [user])

  if (!user || (user.role !== 'Admin' && user.role !== 'Faculty')) {
    return (
      <Container maxW="container.md" py={20}>
        <Box
          textAlign="center"
          p={12}
          bg="rgba(26, 27, 58, 0.7)"
          backdropFilter="blur(20px)"
          borderRadius="2xl"
          border="2px solid"
          borderColor="rgba(255, 0, 110, 0.3)"
          boxShadow="0 0 40px rgba(255, 0, 110, 0.2)"
        >
          <Text fontSize="6xl" mb={4}>🔒</Text>
          <Heading size="lg" color="neon.pink" mb={2}>Access Denied</Heading>
          <Text color="gray.400">This area is restricted to Admins and Faculty only.</Text>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading 
            size="2xl" 
            bgGradient="linear(to-r, neon.cyan, neon.purple)"
            bgClip="text"
            textShadow="0 0 30px rgba(0, 255, 255, 0.6)"
            fontFamily="Orbitron"
          >
            👨‍💼 ADMIN DASHBOARD
          </Heading>
          <Text color="gray.400" mt={2}>System Overview & Management</Text>
          <HStack justify="center" mt={3} spacing={3}>
            <Badge colorScheme="purple" fontSize="sm">
              {user.role}
            </Badge>
            <Badge colorScheme="cyan" fontSize="sm">
              {user.email}
            </Badge>
          </HStack>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {/* Total Events */}
          <Card 
            bg="rgba(26, 27, 58, 0.7)"
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
          >
            <CardBody>
              <Stat>
                <StatLabel color="gray.400" fontSize="sm">📅 Total Events</StatLabel>
                <StatNumber color="neon.pink" fontSize="4xl">{stats.totalEvents}</StatNumber>
                <StatHelpText color="gray.500">
                  {stats.upcomingEvents} upcoming
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          {/* Pending Requests */}
          <Card 
            bg="rgba(26, 27, 58, 0.7)"
            backdropFilter="blur(10px)"
            borderRadius="xl"
            border="2px solid"
            borderColor="rgba(255, 190, 11, 0.3)"
            boxShadow="0 0 20px rgba(255, 190, 11, 0.2)"
            transition="all 0.3s ease"
            _hover={{
              transform: 'translateY(-4px)',
              borderColor: 'rgba(255, 190, 11, 0.6)',
              boxShadow: '0 0 30px rgba(255, 190, 11, 0.4)'
            }}
          >
            <CardBody>
              <Stat>
                <StatLabel color="gray.400" fontSize="sm">⏳ Pending Requests</StatLabel>
                <StatNumber color="neon.yellow" fontSize="4xl">{stats.pendingRequests}</StatNumber>
                <StatHelpText color="gray.500">
                  {stats.pendingRequests > 0 ? 'Awaiting review' : 'All caught up!'}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          {/* Lost Items */}
          <Card 
            bg="rgba(26, 27, 58, 0.7)"
            backdropFilter="blur(10px)"
            borderRadius="xl"
            border="2px solid"
            borderColor="rgba(67, 97, 238, 0.3)"
            boxShadow="0 0 20px rgba(67, 97, 238, 0.2)"
            transition="all 0.3s ease"
            _hover={{
              transform: 'translateY(-4px)',
              borderColor: 'rgba(67, 97, 238, 0.6)',
              boxShadow: '0 0 30px rgba(67, 97, 238, 0.4)'
            }}
          >
            <CardBody>
              <Stat>
                <StatLabel color="gray.400" fontSize="sm">🔍 Lost Items</StatLabel>
                <StatNumber color="neon.blue" fontSize="4xl">{stats.lostItems}</StatNumber>
                <StatHelpText color="gray.500">
                  {stats.foundItems} found items
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Quick Actions */}
        <Box
          p={6}
          bg="rgba(26, 27, 58, 0.7)"
          backdropFilter="blur(20px)"
          borderRadius="2xl"
          border="2px solid"
          borderColor="rgba(0, 255, 255, 0.3)"
          boxShadow="0 0 40px rgba(0, 255, 255, 0.2)"
        >
          <Heading size="md" color="neon.cyan" mb={4}>⚡ Quick Actions</Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            <Button
              variant="neon"
              size="lg"
              onClick={() => window.location.href = '/events'}
              leftIcon={<Text>📅</Text>}
            >
              Manage Events
            </Button>
            <Button
              variant="neonPink"
              size="lg"
              onClick={() => window.location.href = '/feedback'}
              leftIcon={<Text>💬</Text>}
            >
              View Feedback
            </Button>
            <Button
              variant="outline"
              size="lg"
              borderColor="neon.purple"
              color="neon.purple"
              onClick={() => window.location.href = '/lost-found'}
              leftIcon={<Text>🔍</Text>}
            >
              Lost & Found
            </Button>
          </SimpleGrid>
        </Box>

        {/* System Info */}
        <Box
          p={6}
          bg="rgba(26, 27, 58, 0.5)"
          backdropFilter="blur(10px)"
          borderRadius="xl"
          border="1px solid"
          borderColor="rgba(114, 9, 183, 0.3)"
        >
          <Heading size="sm" color="neon.purple" mb={3}>ℹ️ System Information</Heading>
          <VStack align="start" spacing={2} fontSize="sm" color="gray.400">
            <HStack>
              <Text fontWeight="bold" color="neon.purple">Platform:</Text>
              <Text>Smart Campus Ecosystem v1.0</Text>
            </HStack>
            <HStack>
              <Text fontWeight="bold" color="neon.purple">Logged in as:</Text>
              <Text>{user.name} ({user.role})</Text>
            </HStack>
            <HStack>
              <Text fontWeight="bold" color="neon.purple">Email:</Text>
              <Text>{user.email}</Text>
            </HStack>
            <HStack>
              <Text fontWeight="bold" color="neon.purple">Status:</Text>
              <Badge colorScheme="green">Active</Badge>
            </HStack>
          </VStack>
        </Box>
      </VStack>
    </Container>
  )
}
