import asyncHandler from 'express-async-handler'
import Event from '../models/Event.js'
import { emitGlobal } from '../sockets/index.js'

export const createEvent = asyncHandler(async (req, res) => {
  // Only Faculty or Admin can create events directly
  const canCreate = req.user.role === 'Faculty' || req.user.role === 'Admin'
  if (!canCreate) {
    return res.status(403).json({ message: 'Only Faculty and Admins can create events directly. Students must submit event requests for approval.' })
  }
  
  const { eventName, name, date, time, venue, description, category, capacity, prerequisites, coverImage } = req.body
  const eventTitle = name || eventName
  if (!eventTitle || !date) return res.status(400).json({ message: 'Event name and date are required' })
  
  const event = await Event.create({ 
    name: eventTitle,
    eventName: eventTitle, // backwards compatibility
    date, 
    time, 
    venue, 
    description, 
    category,
    capacity,
    prerequisites,
    coverImage,
    createdBy: req.user._id 
  })
  
  emitGlobal(req.app, 'notify', { title: 'New Event', description: `${eventTitle} on ${date}` })
  res.status(201).json(event)
})

export const listEvents = asyncHandler(async (req, res) => {
  // For hackathon speed, treat "upcoming" as sort by date ascending
  const events = await Event.find().sort({ date: 1, createdAt: -1 })
  res.json(events)
})

export const updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params
  const updates = req.body
  const event = await Event.findById(id)
  if (!event) return res.status(404).json({ message: 'Event not found' })
  
  // Only creator, Admin, or Faculty can update
  const isCreator = event.createdBy.toString() === req.user._id.toString()
  const canUpdate = req.user.role === 'Admin' || req.user.role === 'Faculty' || isCreator
  if (!canUpdate) return res.status(403).json({ message: 'Forbidden: You cannot update this event' })
  
  Object.assign(event, updates)
  await event.save()
  emitGlobal(req.app, 'notify', { title: 'Event Updated', description: `${event.eventName}` })
  res.json(event)
})

export const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params
  const event = await Event.findById(id)
  if (!event) return res.status(404).json({ message: 'Event not found' })
  
  // Only creator, Admin, or Faculty can delete
  const isCreator = event.createdBy.toString() === req.user._id.toString()
  const canDelete = req.user.role === 'Admin' || req.user.role === 'Faculty' || isCreator
  if (!canDelete) return res.status(403).json({ message: 'Forbidden: You cannot delete this event' })
  
  await Event.findByIdAndDelete(id)
  emitGlobal(req.app, 'notify', { title: 'Event Cancelled', description: `${event.eventName}` })
  res.json({ message: 'Deleted' })
})
