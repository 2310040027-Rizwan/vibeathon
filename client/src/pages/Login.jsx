import { Heading, Button, Input, VStack, FormControl, FormLabel, useToast, Box, Text, Container } from '@chakra-ui/react'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const navigate = useNavigate()
  const { login } = useAuth()

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login({ email, password })
      toast({ 
        title: '⚡ Login Successful', 
        description: 'Welcome back to Smart Campus!',
        status: 'success', 
        duration: 3000,
        isClosable: true,
      })
      navigate('/')
    } catch (err) {
      console.error('Login error:', err)
      toast({ 
        title: '❌ Login Failed', 
        description: err?.response?.data?.message || err.message || 'Invalid credentials', 
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxW="md" py={20}>
      <Box
        as="form"
        onSubmit={onSubmit}
        bg="rgba(26, 27, 58, 0.7)"
        backdropFilter="blur(20px)"
        borderRadius="2xl"
        border="2px solid"
        borderColor="rgba(0, 255, 255, 0.3)"
        boxShadow="0 0 40px rgba(0, 255, 255, 0.2), inset 0 0 30px rgba(0, 255, 255, 0.05)"
        p={8}
        transition="all 0.3s ease"
        _hover={{
          borderColor: 'rgba(0, 255, 255, 0.6)',
          boxShadow: '0 0 60px rgba(0, 255, 255, 0.4), inset 0 0 40px rgba(0, 255, 255, 0.1)',
        }}
      >
        <VStack spacing={6} align="stretch">
          <Heading 
            size="2xl" 
            textAlign="center"
            bgGradient="linear(to-r, neon.cyan, neon.pink, neon.purple)"
            bgClip="text"
            textShadow="0 0 30px rgba(0, 255, 255, 0.8)"
          >
            LOGIN
          </Heading>
          
          <Text textAlign="center" color="gray.400" fontSize="sm">
            Access your Smart Campus account
          </Text>

          <FormControl isRequired>
            <FormLabel color="neon.cyan" fontWeight="bold">Email</FormLabel>
            <Input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@klh.edu"
              size="lg"
              _autofill={{
                bg: 'rgba(10, 14, 39, 0.8)',
                textFillColor: 'white',
              }}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel color="neon.cyan" fontWeight="bold">Password</FormLabel>
            <Input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              size="lg"
            />
          </FormControl>

          <Button 
            type="submit" 
            isLoading={loading}
            size="lg"
            variant="neon"
            fontSize="md"
            letterSpacing="wide"
          >
            🚀 LOGIN
          </Button>

          <Text textAlign="center" color="gray.500" fontSize="sm">
            Don't have an account?{' '}
            <Text as={Link} to="/register" color="neon.pink" fontWeight="bold" _hover={{ textDecoration: 'underline' }}>
              Register here
            </Text>
          </Text>

          <Box 
            mt={4} 
            p={4} 
            bg="rgba(0, 255, 255, 0.05)" 
            borderRadius="lg" 
            border="1px solid"
            borderColor="rgba(0, 255, 255, 0.2)"
          >
            <Text fontSize="xs" color="gray.400" textAlign="center" mb={2} fontWeight="bold">
              🔐 Demo Accounts
            </Text>
            <VStack spacing={1} fontSize="xs" color="gray.500">
              <Text>👨‍🎓 Student: student@klh.edu / password123</Text>
              <Text>👨‍🏫 Faculty: faculty@klh.edu / password123</Text>
              <Text>👨‍💼 Admin: admin@klh.edu / password123</Text>
            </VStack>
          </Box>
        </VStack>
      </Box>
    </Container>
  )
}
