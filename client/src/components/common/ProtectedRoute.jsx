import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '@chakra-ui/react'
import { useEffect } from 'react'

export default function ProtectedRoute({ children }) {
  const { user } = useAuth()
  const location = useLocation()
  const toast = useToast()

  useEffect(() => {
    if (!user) {
      toast({
        title: '🔒 Authentication Required',
        description: 'Please register or login to access this page',
        status: 'warning',
        duration: 4000,
        isClosable: true,
        position: 'top',
      })
    }
  }, [user, toast])

  if (!user) {
    // Redirect to register page, but save the attempted location
    return <Navigate to="/register" state={{ from: location }} replace />
  }

  return children
}
