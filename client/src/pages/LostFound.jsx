import { useEffect, useMemo, useState } from 'react'
import { Box, Button, Card, CardBody, FormControl, FormLabel, Heading, HStack, Input, InputGroup, InputRightElement, Select, SimpleGrid, Stack, Text, Textarea, useToast, Tag, Container, VStack, Badge, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, ModalFooter, useDisclosure, Image } from '@chakra-ui/react'
import { reportItem, getItems, updateItem } from '../services/lostFound'
import { useAuth } from '../context/AuthContext.jsx'

export default function LostFound() {
  const toast = useToast()
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [filter, setFilter] = useState('all')
  const [form, setForm] = useState({ itemName: '', description: '', location: '', status: 'lost', lostAt: '', imageData: '' })
  const [geoLocation, setGeoLocation] = useState({ latitude: null, longitude: null, address: '' })
  const [submitting, setSubmitting] = useState(false)
  
  // Claim modal state
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [claimingItem, setClaimingItem] = useState(null)
  const [claimImage, setClaimImage] = useState('')
  const [claimNotes, setClaimNotes] = useState('')
  const [claiming, setClaiming] = useState(false)

  const load = async () => {
    try {
      const data = await getItems()
      setItems(data)
    } catch (err) {
      toast({ title: '❌ Failed to load items', status: 'error', duration: 3000 })
    }
  }

  useEffect(() => { load() }, [])

  const canUpdate = (it) => {
    if (!user) return false
    return user.role === 'Admin' || user.id === it.reportedBy?._id || user._id === it.reportedBy?._id
  }

  const filtered = useMemo(() => {
    if (filter === 'all') return items
    return items.filter((i) => i.status === filter)
  }, [items, filter])

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!user) return toast({ title: '🔒 Login required', description: 'Please login to report items', status: 'warning', duration: 3000 })
    setSubmitting(true)
    try {
      // Prepare data to send
      const reportData = { ...form }
      
      // Add GPS coordinates if available
      if (geoLocation.latitude && geoLocation.longitude) {
        reportData.geoLocation = {
          latitude: geoLocation.latitude,
          longitude: geoLocation.longitude,
          address: geoLocation.address
        }
      }
      
      console.log('Submitting form data:', reportData)
      await reportItem(reportData)
      toast({ title: '✅ Item Reported', description: 'Your item has been added to the database', status: 'success', duration: 3000 })
      setForm({ itemName: '', description: '', location: '', status: 'lost', lostAt: '', imageData: '' })
      setGeoLocation({ latitude: null, longitude: null, address: '' })
      await load()
    } catch (err) {
      console.error('Report error:', err)
      console.error('Error response:', err?.response)
      toast({ title: '❌ Report Failed', description: err?.response?.data?.message || err.message, status: 'error', duration: 4000 })
    } finally {
      setSubmitting(false)
    }
  }

  // Enhanced for mobile: support onTouchStart as well
  const onMark = async (id, status) => {
    if (status === 'claimed') {
      // Open claim modal instead of directly updating
      const item = items.find(i => i._id === id)
      setClaimingItem(item)
      onOpen()
      return
    }
    try {
      await updateItem(id, { status })
      toast({ title: '✅ Status Updated', status: 'success', duration: 2000 })
      await load()
    } catch (err) {
      toast({ title: '❌ Update Failed', status: 'error', duration: 3000 })
    }
  }

  const [showClaimSuccess, setShowClaimSuccess] = useState(false)
  const onClaim = async () => {
    if (!claimingItem) return
    if (!user) {
      toast({ title: '🔒 Login required', description: 'Please login to claim items', status: 'warning', duration: 3000 })
      return
    }
    if (!claimImage) {
      toast({ title: '📷 Image Required', description: 'Please upload an image showing you have the item', status: 'warning', duration: 3000 })
      return
    }
    setClaiming(true)
    try {
      await updateItem(claimingItem._id, { 
        status: 'claimed', 
        claimImage, 
        claimNotes 
      })
      setClaimImage('')
      setClaimNotes('')
      setClaimingItem(null)
      onClose()
      setShowClaimSuccess(true)
      await load()
    } catch (err) {
      toast({ 
        title: '❌ Claim Failed', 
        description: err?.response?.data?.message || err.message, 
        status: 'error', 
        duration: 4000 
      })
    } finally {
      setClaiming(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'lost': return 'neon.pink'
      case 'found': return 'neon.green'
      case 'claimed': return 'neon.yellow'
      default: return 'neon.cyan'
    }
  }

  return (
    <Container maxW="container.xl" py={8}>
      {/* Claim Success Modal */}
      <Modal isOpen={showClaimSuccess} onClose={() => setShowClaimSuccess(false)} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color="neon.green">✅ Claim Successful!</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text color="gray.400">You have successfully claimed the item. Our team will contact you soon for verification and handover.</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" onClick={() => setShowClaimSuccess(false)}>OK</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading 
            size="2xl" 
            bgGradient="linear(to-r, neon.cyan, neon.green)"
            bgClip="text"
            textShadow="0 0 30px rgba(6, 255, 165, 0.6)"
            fontFamily="Orbitron"
          >
            🔍 LOST & FOUND
          </Heading>
          <Text color="gray.400" mt={2}>Report and track lost items across campus</Text>
        </Box>

        {/* Report Form */}
        <Box
          as="form"
          onSubmit={onSubmit}
          p={6}
          bg="rgba(26, 27, 58, 0.7)"
          backdropFilter="blur(20px)"
          borderRadius="2xl"
          border="2px solid"
          borderColor="rgba(6, 255, 165, 0.3)"
          boxShadow="0 0 40px rgba(6, 255, 165, 0.2)"
        >
          <Heading size="md" color="neon.green" mb={4}>📝 Report Item</Heading>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel color="neon.cyan" fontWeight="bold">Item Name</FormLabel>
              <Input 
                value={form.itemName} 
                onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                placeholder="e.g., Black Wallet, Phone, Keys"
                size="lg"
              />
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel color="neon.cyan" fontWeight="bold">Status</FormLabel>
              <Select 
                value={form.status} 
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                bg="rgba(26, 27, 58, 0.9)"
                borderColor="rgba(6, 255, 165, 0.3)"
                size="lg"
              >
                <option value="lost" style={{background: '#0a0e27'}}>🔴 Lost</option>
                <option value="found" style={{background: '#0a0e27'}}>🟢 Found</option>
              </Select>
            </FormControl>

            {/* Location Description - Manual Input */}
            <FormControl>
              <FormLabel color="neon.cyan" fontWeight="bold">📍 Location Description</FormLabel>
              <Input 
                value={form.location} 
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g., Library, Cafeteria, Main Building"
              />
              <Text fontSize="xs" color="gray.500" mt={1}>Enter the place name where item was lost/found</Text>
            </FormControl>

            {/* Real-Time Location Detection */}
            <Box
              p={4}
              bg="rgba(0, 255, 255, 0.05)"
              borderRadius="lg"
              border="1px solid"
              borderColor="rgba(0, 255, 255, 0.2)"
            >
              <FormControl>
                <FormLabel color="neon.cyan" fontWeight="bold">🌐 Real-Time GPS Location (Optional)</FormLabel>
                <HStack spacing={3} mb={3}>
                  <Button 
                    variant="neon" 
                    size="sm"
                    onClick={async () => {
                      // Warn user about VPN for accuracy
                      toast({ title: '⚠️ For accurate location, avoid using VPN', status: 'warning', duration: 3000 })
                      if (!navigator.geolocation) return toast({ title: '⚠️ Geolocation not supported', status: 'warning' })
                      try {
                        navigator.geolocation.getCurrentPosition(async (pos) => {
                          const { latitude, longitude } = pos.coords
                          setGeoLocation({ latitude, longitude, address: 'Detecting address...' })
                          
                          // Try reverse geocoding using Nominatim
                          try {
                            const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`)
                            if (resp.ok) {
                              const data = await resp.json()
                              const address = data.display_name || `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`
                              setGeoLocation({ latitude, longitude, address })
                              setForm((f) => ({ ...f, lostAt: new Date().toISOString() }))
                              toast({ title: '📍 Location Detected', description: 'GPS coordinates captured', status: 'success', duration: 3000 })
                              return
                            }
                          } catch (err) {
                            // ignore reverse geocode failure
                          }
                          setGeoLocation({ latitude, longitude, address: 'Address not available' })
                          setForm((f) => ({ ...f, lostAt: new Date().toISOString() }))
                          toast({ title: '📍 GPS Captured', description: 'Coordinates saved', status: 'success', duration: 3000 })
                        }, (e) => {
                          toast({ title: '❌ Failed to get location', description: e?.message || 'Permission denied', status: 'error' })
                        }, { enableHighAccuracy: true, timeout: 10000 })
                      } catch (err) {
                        toast({ title: '❌ Error', description: err?.message || 'Failed to detect location', status: 'error' })
                      }
                    }}
                  >
                    📍 Detect My Location
                  </Button>
                  {geoLocation.latitude && (
                    <Button 
                      size="sm"
                      variant="outline"
                      borderColor="red.400"
                      color="red.400"
                      onClick={() => setGeoLocation({ latitude: null, longitude: null, address: '' })}
                    >
                      ✕ Clear
                    </Button>
                  )}
                </HStack>
                
                {geoLocation.latitude && (
                  <VStack align="stretch" spacing={2}>
                    <HStack spacing={3}>
                      <Box 
                        flex={1} 
                        p={2} 
                        bg="rgba(0, 255, 255, 0.1)" 
                        borderRadius="md"
                        border="1px solid"
                        borderColor="rgba(0, 255, 255, 0.3)"
                      >
                        <Text fontSize="xs" color="gray.500">Latitude</Text>
                        <Text color="neon.cyan" fontWeight="bold" fontSize="sm">
                          {geoLocation.latitude.toFixed(6)}
                        </Text>
                      </Box>
                      <Box 
                        flex={1} 
                        p={2} 
                        bg="rgba(0, 255, 255, 0.1)" 
                        borderRadius="md"
                        border="1px solid"
                        borderColor="rgba(0, 255, 255, 0.3)"
                      >
                        <Text fontSize="xs" color="gray.500">Longitude</Text>
                        <Text color="neon.cyan" fontWeight="bold" fontSize="sm">
                          {geoLocation.longitude.toFixed(6)}
                        </Text>
                      </Box>
                    </HStack>
                    <Box 
                      p={2} 
                      bg="rgba(6, 255, 165, 0.05)" 
                      borderRadius="md"
                      border="1px solid"
                      borderColor="rgba(6, 255, 165, 0.2)"
                    >
                      <Text fontSize="xs" color="gray.500">Detected Address</Text>
                      <Text color="neon.green" fontSize="sm">{geoLocation.address}</Text>
                    </Box>
                  </VStack>
                )}
              </FormControl>
            </Box>

            {/* Photo Upload */}
            <FormControl>
              <FormLabel color="neon.cyan" fontWeight="bold">📷 Upload Photo (Optional)</FormLabel>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const reader = new FileReader()
                  reader.onload = () => {
                    setForm((f) => ({ ...f, imageData: reader.result }))
                    toast({ title: '🖼️ Image attached', status: 'info', duration: 2000 })
                  }
                  reader.readAsDataURL(file)
                }}
                pt={1}
              />
            </FormControl>

            {/* lostAt is auto-filled when detecting location. Optionally allow manual override */}
            <FormControl>
              <FormLabel color="neon.cyan" fontWeight="bold">⏰ When? (Optional override)</FormLabel>
              <Input 
                type="datetime-local" 
                value={form.lostAt ? new Date(form.lostAt).toISOString().slice(0,16) : ''} 
                onChange={(e) => setForm({ ...form, lostAt: e.target.value ? new Date(e.target.value).toISOString() : '' })} 
              />
            </FormControl>

            <FormControl>
              <FormLabel color="neon.cyan" fontWeight="bold">📝 Description</FormLabel>
              <Textarea 
                value={form.description} 
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Add any additional details..."
                rows={3}
              />
            </FormControl>

            <Button 
              type="submit" 
              isLoading={submitting}
              variant="solid"
              size="lg"
              w="full"
            >
              🚀 Report Item
            </Button>
          </VStack>
        </Box>

        {/* Filter */}
        <HStack 
          justify="space-between"
          p={4}
          bg="rgba(26, 27, 58, 0.5)"
          borderRadius="xl"
          border="1px solid"
          borderColor="rgba(0, 255, 255, 0.2)"
        >
          <Text fontWeight="bold" color="neon.cyan">Filter Items:</Text>
          <Select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)} 
            maxW="200px"
            variant="neon"
          >
            <option value="all" style={{background: '#0a0e27'}}>All ({items.length})</option>
            <option value="lost" style={{background: '#0a0e27'}}>🔴 Lost ({items.filter(i => i.status === 'lost').length})</option>
            <option value="found" style={{background: '#0a0e27'}}>🟢 Found ({items.filter(i => i.status === 'found').length})</option>
            <option value="claimed" style={{background: '#0a0e27'}}>✅ Claimed ({items.filter(i => i.status === 'claimed').length})</option>
          </Select>
        </HStack>

        {/* Items Grid */}
        {filtered.length === 0 ? (
          <Box 
            textAlign="center" 
            p={12}
            bg="rgba(26, 27, 58, 0.5)"
            borderRadius="xl"
            border="1px dashed"
            borderColor="rgba(0, 255, 255, 0.3)"
          >
            <Text fontSize="4xl" mb={2}>🔍</Text>
            <Text color="gray.400">No items found</Text>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {filtered.map((it) => (
              <Card 
                key={it._id}
                bg="rgba(26, 27, 58, 0.6)"
                backdropFilter="blur(10px)"
                borderRadius="xl"
                border="2px solid"
                borderColor={`rgba(${it.status === 'lost' ? '255, 0, 110' : it.status === 'found' ? '6, 255, 165' : '255, 190, 11'}, 0.3)`}
                boxShadow={`0 0 20px rgba(${it.status === 'lost' ? '255, 0, 110' : it.status === 'found' ? '6, 255, 165' : '255, 190, 11'}, 0.2)`}
                transition="all 0.3s ease"
                _hover={{
                  transform: 'translateY(-4px)',
                  borderColor: `rgba(${it.status === 'lost' ? '255, 0, 110' : it.status === 'found' ? '6, 255, 165' : '255, 190, 11'}, 0.6)`,
                  boxShadow: `0 0 30px rgba(${it.status === 'lost' ? '255, 0, 110' : it.status === 'found' ? '6, 255, 165' : '255, 190, 11'}, 0.4)`
                }}
              >
                <CardBody>
                  <VStack align="start" spacing={3}>
                    <HStack justify="space-between" w="full">
                      <Heading size="md" color="white">{it.itemName}</Heading>
                      <Badge
                        px={3}
                        py={1}
                        borderRadius="full"
                        bg={`rgba(${it.status === 'lost' ? '255, 0, 110' : it.status === 'found' ? '6, 255, 165' : '255, 190, 11'}, 0.2)`}
                        border="1px solid"
                        borderColor={getStatusColor(it.status)}
                        color={getStatusColor(it.status)}
                        textTransform="uppercase"
                        fontSize="xs"
                        fontWeight="bold"
                      >
                        {it.status === 'lost' ? '🔴' : it.status === 'found' ? '🟢' : '✅'} {it.status}
                      </Badge>
                    </HStack>

                    {it.location && (
                      <HStack spacing={2}>
                        <Text color="neon.cyan" fontSize="sm">📍</Text>
                        <Text color="gray.300" fontSize="sm">{it.location}</Text>
                      </HStack>
                    )}

                    {it.geo?.coordinates && (
                      <HStack spacing={2}>
                        <Text color="neon.cyan" fontSize="sm">🗺️</Text>
                        <Text color="gray.400" fontSize="xs">
                          {it.geo.coordinates[1].toFixed?.(4)}, {it.geo.coordinates[0].toFixed?.(4)}
                        </Text>
                      </HStack>
                    )}

                    {it.lostAt && (
                      <HStack spacing={2}>
                        <Text color="neon.cyan" fontSize="sm">🕒</Text>
                        <Text color="gray.300" fontSize="sm">{new Date(it.lostAt).toLocaleString()}</Text>
                      </HStack>
                    )}

                    {it.description && (
                      <Text color="gray.400" fontSize="sm" noOfLines={3}>{it.description}</Text>
                    )}

                    {it.reportedBy && (
                      <Text fontSize="xs" color="gray.500">
                        👤 Reported by: <Text as="span" color="neon.cyan">{it.reportedBy.name}</Text>
                      </Text>
                    )}

                    {it.status === 'claimed' && it.claimedBy && (
                      <Box
                        w="full"
                        p={3}
                        bg="rgba(255, 190, 11, 0.1)"
                        borderRadius="md"
                        border="1px solid"
                        borderColor="rgba(255, 190, 11, 0.3)"
                      >
                        <Text fontSize="xs" color="neon.yellow" fontWeight="bold" mb={1}>
                          ✅ CLAIMED
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                          By: <Text as="span" color="white">{it.claimedBy.name}</Text>
                        </Text>
                        {it.claimedAt && (
                          <Text fontSize="xs" color="gray.500">
                            {new Date(it.claimedAt).toLocaleString()}
                          </Text>
                        )}
                        {it.claimImage && (
                          <Image 
                            src={it.claimImage} 
                            alt="Claim proof" 
                            mt={2}
                            maxH="150px" 
                            borderRadius="md"
                            border="1px solid"
                            borderColor="rgba(255, 190, 11, 0.3)"
                          />
                        )}
                        {it.claimNotes && (
                          <Text fontSize="xs" color="gray.400" mt={2}>
                            Note: {it.claimNotes}
                          </Text>
                        )}
                      </Box>
                    )}

                    {canUpdate(it) && (
                      <HStack mt={2} spacing={2} w="full">
                        {it.status !== 'claimed' && (
                          <Button 
                            size="sm" 
                            variant="neon" 
                            onClick={() => onMark(it._id, 'claimed')}
                            flex={1}
                          >
                            ✅ Claim
                          </Button>
                        )}
                        {it.status !== 'found' && (
                          <Button 
                            size="sm" 
                            variant="neon" 
                            onClick={() => onMark(it._id, 'found')}
                            flex={1}
                          >
                            🟢 Found
                          </Button>
                        )}
                        {it.status !== 'lost' && (
                          <Button 
                            size="sm" 
                            variant="neonPink" 
                            onClick={() => onMark(it._id, 'lost')}
                            flex={1}
                          >
                            🔴 Lost
                          </Button>
                        )}
                      </HStack>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </VStack>

      {/* Claim Modal with Image Upload */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay bg="rgba(0, 0, 0, 0.8)" backdropFilter="blur(10px)" />
        <ModalContent
          bg="rgba(26, 27, 58, 0.95)"
          backdropFilter="blur(20px)"
          borderRadius="2xl"
          border="2px solid"
          borderColor="rgba(255, 190, 11, 0.4)"
          boxShadow="0 0 50px rgba(255, 190, 11, 0.3)"
        >
          <ModalHeader
            bgGradient="linear(to-r, neon.yellow, neon.cyan)"
            bgClip="text"
            textShadow="0 0 20px rgba(255, 190, 11, 0.6)"
            fontSize="2xl"
          >
            ✅ Claim Item: {claimingItem?.itemName}
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Box
                p={4}
                bg="rgba(255, 190, 11, 0.1)"
                borderRadius="lg"
                border="1px solid"
                borderColor="rgba(255, 190, 11, 0.3)"
              >
                <Text color="neon.yellow" fontWeight="bold" mb={2}>
                  ⚠️ Important Instructions:
                </Text>
                <VStack align="start" spacing={1} fontSize="sm" color="gray.300">
                  <Text>• Upload a clear photo showing you have the item</Text>
                  <Text>• The photo will be verified by the person who reported it</Text>
                  <Text>• Provide additional notes if needed</Text>
                  <Text>• False claims may result in account suspension</Text>
                </VStack>
              </Box>

              <FormControl isRequired>
                <FormLabel color="neon.cyan" fontWeight="bold">
                  📷 Upload Image Proof (Required)
                </FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    if (file.size > 2 * 1024 * 1024) {
                      toast({ 
                        title: '❌ File too large', 
                        description: 'Image must be under 2MB', 
                        status: 'error', 
                        duration: 3000 
                      })
                      return
                    }
                    const reader = new FileReader()
                    reader.onload = () => {
                      setClaimImage(reader.result)
                      toast({ title: '✅ Image attached', status: 'success', duration: 2000 })
                    }
                    reader.readAsDataURL(file)
                  }}
                  pt={1}
                  borderColor="rgba(0, 255, 255, 0.3)"
                  _hover={{ borderColor: 'rgba(0, 255, 255, 0.6)' }}
                />
                {claimImage && (
                  <Box mt={3}>
                    <Image 
                      src={claimImage} 
                      alt="Claim proof" 
                      maxH="200px" 
                      borderRadius="lg"
                      border="2px solid"
                      borderColor="rgba(6, 255, 165, 0.3)"
                    />
                  </Box>
                )}
              </FormControl>

              <FormControl>
                <FormLabel color="neon.cyan" fontWeight="bold">
                  📝 Additional Notes (Optional)
                </FormLabel>
                <Textarea
                  value={claimNotes}
                  onChange={(e) => setClaimNotes(e.target.value)}
                  placeholder="Add any additional information about the item..."
                  rows={3}
                  borderColor="rgba(0, 255, 255, 0.3)"
                  _hover={{ borderColor: 'rgba(0, 255, 255, 0.6)' }}
                />
              </FormControl>

              {claimingItem?.reportedBy && (
                <Box
                  p={3}
                  bg="rgba(0, 255, 255, 0.05)"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="rgba(0, 255, 255, 0.2)"
                >
                  <Text fontSize="sm" color="gray.400">
                    <Text as="span" color="neon.cyan" fontWeight="bold">Reported by:</Text>{' '}
                    {claimingItem.reportedBy.name} ({claimingItem.reportedBy.email})
                  </Text>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="neon"
              onClick={onClaim}
              onTouchStart={onClaim}
              isLoading={claiming}
              isDisabled={!claimImage}
            >
              ✅ Submit Claim
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  )
}
