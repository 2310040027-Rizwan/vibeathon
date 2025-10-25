import { Heading, Text, VStack, Box, SimpleGrid, Container, HStack, Badge, Spinner, useToast, Button } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import { getItems } from '../services/lostFound'
import { io } from 'socket.io-client'

const FeatureCard = ({ title, description, icon, to, color }) => (
  <Box
    as={Link}
    to={to}
    p={6}
    bg="rgba(26, 27, 58, 0.6)"
    backdropFilter="blur(10px)"
    borderRadius="xl"
    border="2px solid"
    borderColor={`rgba(${color}, 0.3)`}
    boxShadow={`0 0 30px rgba(${color}, 0.2)`}
    transition="all 0.3s ease"
    cursor="pointer"
    _hover={{
      transform: 'translateY(-8px) scale(1.02)',
      borderColor: `rgba(${color}, 0.8)`,
      boxShadow: `0 0 50px rgba(${color}, 0.5), inset 0 0 30px rgba(${color}, 0.1)`,
    }}
  >
    <VStack align="start" spacing={3}>
      <Text fontSize="4xl">{icon}</Text>
      <Heading 
        size="md" 
        color={`rgba(${color}, 1)`}
        textShadow={`0 0 15px rgba(${color}, 0.8)`}
      >
        {title}
      </Heading>
      <Text color="gray.400" fontSize="sm">{description}</Text>
    </VStack>
  </Box>
)

export default function Home() {
  const { user } = useAuth()
  const toast = useToast()
  const [lostItems, setLostItems] = useState([])
  const [recentFoundUpdates, setRecentFoundUpdates] = useState([])
  const [loading, setLoading] = useState(true)

  // Load lost items on mount
  useEffect(() => {
    const loadLostItems = async () => {
      try {
        const items = await getItems()
        // Show only lost items, latest 5
        const lost = items.filter(i => i.status === 'lost').slice(0, 5)
        setLostItems(lost)
      } catch (err) {
        console.error('Failed to load lost items:', err)
      } finally {
        setLoading(false)
      }
    }
    loadLostItems()
  }, [])

  // Real-time socket listener for lost & found updates
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000', {
      withCredentials: true,
      transports: ['websocket', 'polling']
    })

    socket.on('notify', (data) => {
      // Listen for new lost item reports
      if (data.title === 'New Lost/Found Report' || data.description?.includes('lost')) {
        // Reload lost items to show the new report
        getItems().then(items => {
          const lost = items.filter(i => i.status === 'lost').slice(0, 5)
          setLostItems(lost)
        }).catch(err => console.error('Failed to reload items:', err))
        
        toast({
          title: '🔴 New Lost Item Reported!',
          description: data.description || 'Check the Lost & Found section',
          status: 'info',
          duration: 4000,
          isClosable: true,
        })
      }
      
      // Filter for "found" status updates
      if (data.type === 'lost-found-update' && data.item?.status === 'found') {
        setRecentFoundUpdates(prev => [{
          ...data.item,
          timestamp: new Date().toISOString()
        }, ...prev].slice(0, 10)) // Keep last 10
        
        toast({
          title: '✅ Item Found!',
          description: `${data.item.itemName} has been marked as found`,
          status: 'success',
          duration: 4000,
          isClosable: true,
        })
      }
    })

    return () => socket.disconnect()
  }, [toast])

  const features = [
    {
      title: 'Lost & Found',
      description: 'Report and track lost items across campus',
      icon: '🔍',
      to: '/lost-found',
      color: '0, 255, 255', // cyan
    },
    {
      title: 'Events',
      description: 'Discover campus events and activities',
      icon: '📅',
      to: '/events',
      color: '255, 0, 110', // pink
    },
    {
      title: 'Feedback',
      description: 'Share your thoughts and grievances',
      icon: '💬',
      to: '/feedback',
      color: '114, 9, 183', // purple
    },
  ]

  return (
    <Container maxW="container.xl" py={12}>
      <VStack spacing={12} align="stretch">
        <Box textAlign="center" py={8}>
          <Heading 
            size="3xl" 
            bgGradient="linear(to-r, neon.cyan, neon.pink, neon.purple, neon.blue)"
            bgClip="text"
            textShadow="0 0 40px rgba(0, 255, 255, 0.6)"
            mb={4}
            fontFamily="Orbitron"
            letterSpacing="wider"
          >
            WELCOME TO SMART CAMPUS
          </Heading>
          <Text fontSize="xl" color="gray.400">
            {user ? `Hey ${user.name}! 👋` : 'Your Digital Campus Ecosystem 🚀'}
          </Text>
          <Text fontSize="lg" color="gray.500" mt={2}>
            Explore modules • Connect with peers • Stay informed
          </Text>
        </Box>

        {/* Guest Call-to-Action Banner */}
        {!user && (
          <Box
            p={8}
            bg="rgba(255, 0, 110, 0.1)"
            backdropFilter="blur(20px)"
            borderRadius="2xl"
            border="2px solid"
            borderColor="rgba(255, 0, 110, 0.4)"
            boxShadow="0 0 50px rgba(255, 0, 110, 0.3)"
            textAlign="center"
            position="relative"
            overflow="hidden"
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.05), rgba(255, 0, 110, 0.05))',
              animation: 'pulse 3s ease-in-out infinite'
            }}
          >
            <VStack spacing={4} position="relative" zIndex={1}>
              <Text fontSize="3xl" mb={2}>🚀✨</Text>
              <Heading 
                size="lg" 
                bgGradient="linear(to-r, neon.cyan, neon.pink)"
                bgClip="text"
                textShadow="0 0 20px rgba(255, 0, 110, 0.6)"
              >
                Unlock Full Access!
              </Heading>
              <Text color="gray.300" maxW="600px">
                Register now to report lost items, request events, submit feedback, and much more!
              </Text>
              <HStack spacing={4} pt={4}>
                <Button
                  as={Link}
                  to="/register"
                  size="lg"
                  variant="neonPink"
                  fontSize="md"
                  px={8}
                >
                  ✨ Register Now
                </Button>
                <Button
                  as={Link}
                  to="/login"
                  size="lg"
                  variant="neon"
                  fontSize="md"
                  px={8}
                >
                  🔐 Login
                </Button>
              </HStack>
            </VStack>
          </Box>
        )}

        {/* Lost Items Quick View */}
        <Box
          p={6}
          bg="rgba(26, 27, 58, 0.6)"
          backdropFilter="blur(10px)"
          borderRadius="xl"
          border="2px solid"
          borderColor="rgba(255, 0, 110, 0.3)"
          boxShadow="0 0 30px rgba(255, 0, 110, 0.2)"
        >
          <HStack justify="space-between" mb={4}>
            <Heading size="md" color="neon.pink">
              🔴 Recently Lost Items
            </Heading>
            <Button
              as={Link}
              to="/lost-found"
              size="sm"
              variant="ghost"
              color="neon.cyan"
              _hover={{ 
                bg: 'rgba(0, 255, 255, 0.1)',
                textDecoration: 'none'
              }}
            >
              View All →
            </Button>
          </HStack>
          
          {loading ? (
            <HStack justify="center" py={8}>
              <Spinner color="neon.pink" />
              <Text color="gray.400">Loading...</Text>
            </HStack>
          ) : lostItems.length === 0 ? (
            <Text color="gray.500" textAlign="center" py={4}>
              No lost items reported recently
            </Text>
          ) : (
            <VStack align="stretch" spacing={3}>
              {lostItems.map((item) => (
                <HStack
                  key={item._id}
                  p={3}
                  bg="rgba(255, 0, 110, 0.05)"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="rgba(255, 0, 110, 0.2)"
                  justify="space-between"
                  _hover={{ bg: 'rgba(255, 0, 110, 0.1)' }}
                >
                  <VStack align="start" spacing={1}>
                    <Text color="white" fontWeight="bold">{item.itemName}</Text>
                    <HStack spacing={3} fontSize="sm">
                      {item.location && (
                        <Text color="gray.400">📍 {item.location}</Text>
                      )}
                      {item.lostAt && (
                        <Text color="gray.500">{new Date(item.lostAt).toLocaleDateString()}</Text>
                      )}
                    </HStack>
                  </VStack>
                  <Badge
                    px={2}
                    py={1}
                    borderRadius="md"
                    bg="rgba(255, 0, 110, 0.2)"
                    color="neon.pink"
                    fontSize="xs"
                  >
                    LOST
                  </Badge>
                </HStack>
              ))}
            </VStack>
          )}
        </Box>

        {/* Claim & Found Items Action Section */}
        <Box
          p={8}
          bg="rgba(26, 27, 58, 0.6)"
          backdropFilter="blur(10px)"
          borderRadius="xl"
          border="2px solid"
          borderColor="rgba(6, 255, 165, 0.3)"
          boxShadow="0 0 30px rgba(6, 255, 165, 0.2)"
          textAlign="center"
        >
          <Heading 
            size="lg" 
            color="neon.green"
            mb={4}
            textShadow="0 0 20px rgba(6, 255, 165, 0.6)"
          >
            📦 Found Something? Claim an Item?
          </Heading>
          <Text color="gray.400" mb={6} maxW="600px" mx="auto">
            If you found an item or want to claim a lost item, head to our Lost & Found section. 
            You'll need to be logged in to report or claim items with photo verification.
          </Text>
          <HStack spacing={4} justify="center" flexWrap="wrap">
            <Button
              as={Link}
              to="/lost-found"
              size="lg"
              variant="neonPink"
              leftIcon={<Text>🎁</Text>}
              px={8}
            >
              Report Found Item
            </Button>
            <Button
              as={Link}
              to="/lost-found"
              size="lg"
              variant="neon"
              leftIcon={<Text>✅</Text>}
              px={8}
            >
              Claim Lost Item
            </Button>
          </HStack>
          {!user && (
            <Text color="neon.yellow" fontSize="sm" mt={4}>
              ⚠️ You must login to report or claim items
            </Text>
          )}
        </Box>

        {/* Real-time Found Updates Feed */}
        {recentFoundUpdates.length > 0 && (
          <Box
            p={6}
            bg="rgba(26, 27, 58, 0.6)"
            backdropFilter="blur(10px)"
            borderRadius="xl"
            border="2px solid"
            borderColor="rgba(6, 255, 165, 0.3)"
            boxShadow="0 0 30px rgba(6, 255, 165, 0.2)"
          >
            <Heading size="md" color="neon.green" mb={4}>
              🟢 Real-time Found Updates
            </Heading>
            <VStack align="stretch" spacing={3}>
              {recentFoundUpdates.map((item, idx) => (
                <HStack
                  key={`${item._id}-${idx}`}
                  p={3}
                  bg="rgba(6, 255, 165, 0.05)"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="rgba(6, 255, 165, 0.2)"
                  justify="space-between"
                  animation="fadeIn 0.5s ease-in"
                >
                  <VStack align="start" spacing={1}>
                    <Text color="white" fontWeight="bold">{item.itemName}</Text>
                    <Text color="gray.400" fontSize="sm">
                      {item.location || 'Unknown location'} • Just now
                    </Text>
                  </VStack>
                  <Badge
                    px={2}
                    py={1}
                    borderRadius="md"
                    bg="rgba(6, 255, 165, 0.2)"
                    color="neon.green"
                    fontSize="xs"
                  >
                    ✅ FOUND
                  </Badge>
                </HStack>
              ))}
            </VStack>
          </Box>
        )}

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          {features.map((feature, idx) => (
            <FeatureCard key={idx} {...feature} />
          ))}
        </SimpleGrid>

        {!user && (
          <Box
            textAlign="center"
            p={8}
            bg="rgba(26, 27, 58, 0.5)"
            borderRadius="xl"
            border="2px solid"
            borderColor="rgba(255, 190, 11, 0.3)"
            boxShadow="0 0 30px rgba(255, 190, 11, 0.2)"
          >
            <Text fontSize="lg" color="neon.yellow" fontWeight="bold" mb={3}>
              🔐 Get Started
            </Text>
            <Text color="gray.400">
              Login or register to access all features
            </Text>
          </Box>
        )}
      </VStack>
    </Container>
  )
}
