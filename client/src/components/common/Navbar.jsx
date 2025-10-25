import { Box, Flex, HStack, Link as CLink, Button, Spacer, Text, Avatar, Menu, MenuButton, MenuList, MenuItem, useToast } from '@chakra-ui/react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

const links = [
  { to: '/', label: '🏠 Home', icon: '🏠' },
  { to: '/lost-found', label: '🔍 Lost & Found', icon: '🔍' },
  { to: '/events', label: '📅 Events', icon: '📅' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const toast = useToast()

  const handleLogout = async () => {
    await logout()
    toast({
      title: '👋 Logged Out',
      description: 'See you next time!',
      status: 'info',
      duration: 2000,
      isClosable: true,
    })
  }

  return (
    <Box 
      bg="rgba(10, 14, 39, 0.9)" 
      backdropFilter="blur(10px)"
      borderBottom="2px solid" 
      borderColor="rgba(0, 255, 255, 0.3)"
      boxShadow="0 4px 20px rgba(0, 255, 255, 0.2)"
      px={6}
      position="sticky"
      top={0}
      zIndex={1000}
    >
      <Flex h={16} align="center">
        <Text 
          fontWeight="900" 
          fontSize="2xl"
          fontFamily="Orbitron"
          bgGradient="linear(to-r, neon.cyan, neon.pink)"
          bgClip="text"
          textShadow="0 0 20px rgba(0, 255, 255, 0.8)"
          letterSpacing="wider"
        >
          SMART CAMPUS
        </Text>
        <HStack spacing={2} ml={8}>
          {links.map(l => (
            <CLink 
              as={Link} 
              key={l.to} 
              to={l.to} 
              px={4}
              py={2}
              borderRadius="md"
              fontWeight={pathname === l.to ? 'bold' : 'medium'}
              color={pathname === l.to ? 'neon.cyan' : 'gray.400'}
              bg={pathname === l.to ? 'rgba(0, 255, 255, 0.1)' : 'transparent'}
              border="1px solid"
              borderColor={pathname === l.to ? 'rgba(0, 255, 255, 0.5)' : 'transparent'}
              textShadow={pathname === l.to ? '0 0 10px rgba(0, 255, 255, 0.8)' : 'none'}
              transition="all 0.3s ease"
              _hover={{
                color: 'neon.cyan',
                bg: 'rgba(0, 255, 255, 0.1)',
                borderColor: 'rgba(0, 255, 255, 0.5)',
                textDecoration: 'none',
                transform: 'translateY(-2px)',
              }}
            >
              {l.label}
            </CLink>
          ))}
        </HStack>
        <Spacer />
        <HStack spacing={3}>
          {!user ? (
            <>
              <Button 
                as={Link} 
                to="/login" 
                size="md" 
                variant="neon"
              >
                LOGIN
              </Button>
              <Button 
                as={Link} 
                to="/register" 
                size="md" 
                variant="neonPink"
              >
                REGISTER
              </Button>
            </>
          ) : (
            <Menu>
              <MenuButton 
                as={Button} 
                size="md" 
                variant="neon"
                rightIcon={<Avatar size="sm" name={user.name} bg="neon.purple" color="white" />}
              > 
                {user.name} • {user.role}
              </MenuButton>
              <MenuList 
                bg="rgba(10, 14, 39, 0.95)" 
                borderColor="rgba(0, 255, 255, 0.3)"
                boxShadow="0 8px 30px rgba(0, 255, 255, 0.3)"
              >
                {(user.role === 'Admin' || user.role === 'Faculty') && (
                  <MenuItem 
                    as={Link} 
                    to="/admin"
                    bg="transparent"
                    color="neon.cyan"
                    _hover={{ bg: 'rgba(0, 255, 255, 0.1)' }}
                  >
                    👨‍💼 Dashboard
                  </MenuItem>
                )}
                <MenuItem 
                  onClick={handleLogout}
                  bg="transparent"
                  color="neon.pink"
                  _hover={{ bg: 'rgba(255, 0, 110, 0.1)' }}
                >
                  🚪 Logout
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </HStack>
      </Flex>
    </Box>
  )
}
