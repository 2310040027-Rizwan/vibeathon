import { useEffect } from 'react'
import { useToast } from '@chakra-ui/react'
import { io } from 'socket.io-client'

const socket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000', {
  transports: ['websocket'],
})

export default function NotificationToaster() {
  const toast = useToast()

  useEffect(() => {
    function notify({ title = 'Update', description = '' }) {
      toast({ title, description, status: 'info', duration: 4000, isClosable: true })
    }

    socket.on('notify', notify)
    return () => {
      socket.off('notify', notify)
    }
  }, [toast])

  return null
}
