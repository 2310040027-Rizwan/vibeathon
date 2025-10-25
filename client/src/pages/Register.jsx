import { Heading, Button, Input, VStack, FormControl, FormLabel, Select, HStack, useToast, Box, Text, Container } from '@chakra-ui/react'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Student')
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const navigate = useNavigate()
  const { register } = useAuth()

  // Email validation helper
  const validateEmail = () => {
    const studentEmailRegex = /^2[0-9]10[0-9]{2}00[0-9]{2}@klh\.edu\.in$/i
    const isStudentFormat = studentEmailRegex.test(email)
    
    if (role === 'Student') {
      if (!isStudentFormat) {
        toast({
          title: '❌ Invalid Student Email',
          description: 'Student email must be in format: 2x100x00xy@klh.edu.in (e.g., 2310040027@klh.edu.in)',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
        return false
      }
    } else {
      // Faculty or Admin
      if (isStudentFormat) {
        toast({
          title: '❌ Invalid Email',
          description: 'Faculty/Admin cannot use student email format',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
        return false
      }
      if (!email.includes('@')) {
        toast({
          title: '❌ Invalid Email',
          description: 'Please enter a valid email address',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
        return false
      }
    }
    return true
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    
    // Validate email format based on role
    if (!validateEmail()) {
      return
    }

    // Check verification code for Faculty/Admin
    if ((role === 'Faculty' || role === 'Admin') && !verificationCode) {
      toast({
        title: '❌ Verification Code Required',
        description: 'Please enter the verification code to register as Faculty/Admin',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }
    
    setLoading(true)
    try {
      await register({ name, email, password, role, verificationCode })
      toast({ 
        title: '✨ Registration Successful', 
        description: 'Welcome to Smart Campus!',
        status: 'success', 
        duration: 3000,
        isClosable: true,
      })
      navigate('/')
    } catch (err) {
      console.error('Registration error:', err)
      toast({ 
        title: '❌ Registration Failed', 
        description: err?.response?.data?.message || err.message, 
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxW="md" py={12}>
      <Box
        as="form"
        onSubmit={onSubmit}
        bg="rgba(26, 27, 58, 0.7)"
        backdropFilter="blur(20px)"
        borderRadius="2xl"
        border="2px solid"
        borderColor="rgba(255, 0, 110, 0.3)"
        boxShadow="0 0 40px rgba(255, 0, 110, 0.2), inset 0 0 30px rgba(255, 0, 110, 0.05)"
        p={8}
        transition="all 0.3s ease"
        _hover={{
          borderColor: 'rgba(255, 0, 110, 0.6)',
          boxShadow: '0 0 60px rgba(255, 0, 110, 0.4), inset 0 0 40px rgba(255, 0, 110, 0.1)',
        }}
      >
        <VStack spacing={5} align="stretch">
          <Heading 
            size="2xl" 
            textAlign="center"
            bgGradient="linear(to-r, neon.pink, neon.purple, neon.blue)"
            bgClip="text"
            textShadow="0 0 30px rgba(255, 0, 110, 0.8)"
          >
            REGISTER
          </Heading>
          
          <Text textAlign="center" color="gray.400" fontSize="sm">
            Join the Smart Campus ecosystem
          </Text>

          <FormControl isRequired>
            <FormLabel color="neon.pink" fontWeight="bold">Full Name</FormLabel>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              size="lg"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel color="neon.pink" fontWeight="bold">Email</FormLabel>
            <Input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder={role === 'Student' ? '2310040027@klh.edu.in' : 'your.email@klh.edu.in'}
              size="lg"
            />
            <Text fontSize="xs" color="gray.500" mt={1}>
              {role === 'Student' 
                ? '📧 Format: 2x100x00xy@klh.edu.in (Student Roll Number)' 
                : '📧 Use any email except student format'}
            </Text>
          </FormControl>

          <FormControl isRequired>
            <FormLabel color="neon.pink" fontWeight="bold">Password</FormLabel>
            <Input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              size="lg"
            />
          </FormControl>

          <FormControl>
            <FormLabel color="neon.pink" fontWeight="bold">Role</FormLabel>
            <Select 
              value={role} 
              onChange={(e) => setRole(e.target.value)} 
              size="lg"
              bg="rgba(26, 27, 58, 0.9)"
              borderColor="rgba(255, 0, 110, 0.3)"
              color="white"
              _hover={{
                borderColor: 'neon.pink'
              }}
              _focus={{
                borderColor: 'neon.pink',
                boxShadow: '0 0 10px rgba(255, 0, 110, 0.4)'
              }}
            >
              <option value="Student" style={{background: '#1a1b3a', color: '#00ffff'}}>🎓 Student</option>
              <option value="Faculty" style={{background: '#1a1b3a', color: '#06ffa5'}}>👨‍🏫 Faculty</option>
              <option value="Admin" style={{background: '#1a1b3a', color: '#ff006e'}}>👨‍💼 Admin</option>
            </Select>
          </FormControl>

          {/* Verification Code - Only for Faculty/Admin */}
          {(role === 'Faculty' || role === 'Admin') && (
            <FormControl isRequired>
              <FormLabel color="neon.yellow" fontWeight="bold">
                🔐 Verification Code
              </FormLabel>
              <Input 
                type="password"
                value={verificationCode} 
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter Faculty/Admin verification code"
                size="lg"
                bg="rgba(255, 190, 11, 0.05)"
                borderColor="rgba(255, 190, 11, 0.3)"
                _hover={{
                  borderColor: 'neon.yellow'
                }}
                _focus={{
                  borderColor: 'neon.yellow',
                  boxShadow: '0 0 10px rgba(255, 190, 11, 0.4)'
                }}
              />
              <Text fontSize="xs" color="neon.yellow" mt={1}>
                ⚠️ Authorized personnel only. Contact admin for verification code.
              </Text>
            </FormControl>
          )}

          <Button 
            type="submit" 
            isLoading={loading}
            size="lg"
            variant="neonPink"
            fontSize="md"
            letterSpacing="wide"
          >
            ✨ CREATE ACCOUNT
          </Button>

          <Text textAlign="center" color="gray.500" fontSize="sm">
            Already have an account?{' '}
            <Text as={Link} to="/login" color="neon.cyan" fontWeight="bold" _hover={{ textDecoration: 'underline' }}>
              Login here
            </Text>
          </Text>
        </VStack>
      </Box>
    </Container>
  )
}
