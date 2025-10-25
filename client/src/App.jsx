import { Box } from '@chakra-ui/react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/common/Navbar.jsx'
import ProtectedRoute from './components/common/ProtectedRoute.jsx'
import Home from './pages/Home.jsx'
import LostFound from './pages/LostFound.jsx'
import Events from './pages/Events.jsx'
import Feedback from './pages/Feedback.jsx'
import Admin from './pages/Admin.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import NotificationToaster from './components/common/NotificationToaster.jsx'
import ChatWidget from './components/chat/ChatWidget.jsx'

export default function App() {
  return (
    <Box minH="100vh">
      <Navbar />
      <Box py={6}>
        <Routes>
          {/* Public Routes - Guests can access */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes - Login Required */}
          <Route path="/lost-found" element={<ProtectedRoute><LostFound /></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
          <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        </Routes>
      </Box>
      <NotificationToaster />
      <ChatWidget />
    </Box>
  )
}
