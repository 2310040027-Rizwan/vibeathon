import asyncHandler from 'express-async-handler'
import LostFoundItem from '../models/LostFoundItem.js'
import { emitGlobal } from '../sockets/index.js'

export const reportItem = asyncHandler(async (req, res) => {
  try {
    // Accepts JSON payload. Client may include `imageData` (base64), `location`, and optional `geoLocation`
    const { itemName, description, location, status, lostAt, imageData, geoLocation } = req.body
    
    console.log('Report item request:', { itemName, description, location, status, hasImage: !!imageData, geoLocation })
    console.log('User:', req.user)
    
    if (!itemName) return res.status(400).json({ message: 'itemName is required' })
    if (!req.user) return res.status(401).json({ message: 'User not authenticated' })

    const itemData = {
      itemName,
      description,
      location: location || 'Unknown location',
      status: status || 'lost',
      reportedBy: req.user._id,
    }

    // If client provided GPS coordinates, add geo field
    if (geoLocation && geoLocation.latitude && geoLocation.longitude) {
      itemData.geo = {
        type: 'Point',
        coordinates: [geoLocation.longitude, geoLocation.latitude] // [lng, lat] order for GeoJSON
      }
      console.log('Added geo coordinates:', itemData.geo)
    }

    // If client provided image data (base64) include it
    if (imageData) {
      itemData.imageData = imageData
    }

    // If reporter didn't specify lostAt, set it to now
    if (lostAt) {
      const dt = new Date(lostAt)
      if (!isNaN(dt.getTime())) itemData.lostAt = dt
    } else {
      itemData.lostAt = new Date()
    }

    console.log('Creating item with data:', { ...itemData, imageData: imageData ? 'base64...' : null })
    const item = await LostFoundItem.create(itemData)
    console.log('Item created:', item._id)

    emitGlobal(req.app, 'notify', { title: 'New Lost/Found Report', description: `${item.itemName} (${item.status})` })
    res.status(201).json(item)
  } catch (error) {
    console.error('Report item error:', error)
    res.status(500).json({ message: error.message || 'Internal server error' })
  }
})

export const listItems = asyncHandler(async (req, res) => {
  const items = await LostFoundItem.find().sort({ createdAt: -1 }).populate('reportedBy', 'name email role')
  res.json(items)
})

export const updateItemStatus = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { status, lostAt, imageData, location, claimImage, claimNotes } = req.body
  const item = await LostFoundItem.findById(id)
  if (!item) return res.status(404).json({ message: 'Item not found' })

  const isOwner = item.reportedBy.toString() === req.user._id.toString()
  const isAdmin = req.user.role === 'Admin'
  if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Forbidden' })

  if (status) {
    item.status = status
    
    // If claiming, require image proof and store claimer info
    if (status === 'claimed') {
      if (!claimImage) {
        return res.status(400).json({ message: 'Claim image is required to claim an item' })
      }
      item.claimedBy = req.user._id
      item.claimedAt = new Date()
      item.claimImage = claimImage
      item.claimNotes = claimNotes || ''
    }
  }

  // Update optional fields
  if (location) item.location = location
  if (imageData) item.imageData = imageData
  if (lostAt) {
    const dt = new Date(lostAt)
    if (!isNaN(dt.getTime())) item.lostAt = dt
  }
  await item.save()

  const populatedItem = await LostFoundItem.findById(item._id)
    .populate('reportedBy', 'name email')
    .populate('claimedBy', 'name email')

  emitGlobal(req.app, 'notify', { 
    title: status === 'claimed' ? 'Item Claimed!' : 'Item Updated', 
    description: `${item.itemName} is now ${item.status}` 
  })
  res.json(populatedItem)
})
