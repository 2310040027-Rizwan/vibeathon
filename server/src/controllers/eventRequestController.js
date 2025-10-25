import EventRequest from '../models/EventRequest.js'
import Event from '../models/Event.js'
import asyncHandler from 'express-async-handler'

// @desc    Submit event request (Students only)
// @route   POST /api/event-requests
// @access  Private (Student)
export const submitEventRequest = asyncHandler(async (req, res) => {
  const { eventName, date, time, venue, description, category, capacity, prerequisites, coverImage } = req.body

  if (req.user.role !== 'Student') {
    res.status(403)
    throw new Error('Only students can submit event requests')
  }

  const eventRequest = await EventRequest.create({
    eventName,
    date,
    time,
    venue,
    description,
    category,
    capacity,
    prerequisites,
    coverImage,
    requestedBy: req.user._id,
  })

  const populatedRequest = await EventRequest.findById(eventRequest._id).populate('requestedBy', 'name email')

  res.status(201).json(populatedRequest)
})

// @desc    Get all event requests (Faculty/Admin see all, Students see their own)
// @route   GET /api/event-requests
// @access  Private
export const getEventRequests = asyncHandler(async (req, res) => {
  let query = {}

  // Students can only see their own requests
  if (req.user.role === 'Student') {
    query.requestedBy = req.user._id
  }
  // Faculty and Admin can see all requests (or filter by status)
  if (req.query.status) {
    query.status = req.query.status
  }

  const requests = await EventRequest.find(query)
    .populate('requestedBy', 'name email')
    .populate('reviewedBy', 'name email')
    .sort({ createdAt: -1 })

  res.json(requests)
})

// @desc    Approve event request (Faculty/Admin only)
// @route   PUT /api/event-requests/:id/approve
// @access  Private (Faculty/Admin)
export const approveEventRequest = asyncHandler(async (req, res) => {
  const { reviewNotes } = req.body

  if (req.user.role !== 'Faculty' && req.user.role !== 'Admin') {
    res.status(403)
    throw new Error('Only Faculty and Admin can approve event requests')
  }

  const eventRequest = await EventRequest.findById(req.params.id).populate('requestedBy', 'name email')

  if (!eventRequest) {
    res.status(404)
    throw new Error('Event request not found')
  }

  if (eventRequest.status !== 'pending') {
    res.status(400)
    throw new Error('Event request has already been reviewed')
  }

  // Create the actual event
  const event = await Event.create({
    name: eventRequest.eventName,
    date: eventRequest.date,
    time: eventRequest.time,
    venue: eventRequest.venue,
    description: eventRequest.description,
    category: eventRequest.category,
    capacity: eventRequest.capacity,
    prerequisites: eventRequest.prerequisites,
    coverImage: eventRequest.coverImage,
    createdBy: eventRequest.requestedBy._id, // Keep student as creator
  })

  // Update request status
  eventRequest.status = 'approved'
  eventRequest.reviewedBy = req.user._id
  eventRequest.reviewedAt = new Date()
  eventRequest.reviewNotes = reviewNotes
  eventRequest.eventId = event._id
  await eventRequest.save()

  const populatedRequest = await EventRequest.findById(eventRequest._id)
    .populate('requestedBy', 'name email')
    .populate('reviewedBy', 'name email')

  // Emit socket notification
  if (req.io) {
    req.io.to(`user:${eventRequest.requestedBy._id}`).emit('event-request-approved', {
      message: `Your event "${eventRequest.eventName}" has been approved!`,
      eventRequest: populatedRequest,
      event,
    })
  }

  res.json({ eventRequest: populatedRequest, event })
})

// @desc    Reject event request (Faculty/Admin only)
// @route   PUT /api/event-requests/:id/reject
// @access  Private (Faculty/Admin)
export const rejectEventRequest = asyncHandler(async (req, res) => {
  const { reviewNotes } = req.body

  if (req.user.role !== 'Faculty' && req.user.role !== 'Admin') {
    res.status(403)
    throw new Error('Only Faculty and Admin can reject event requests')
  }

  const eventRequest = await EventRequest.findById(req.params.id).populate('requestedBy', 'name email')

  if (!eventRequest) {
    res.status(404)
    throw new Error('Event request not found')
  }

  if (eventRequest.status !== 'pending') {
    res.status(400)
    throw new Error('Event request has already been reviewed')
  }

  eventRequest.status = 'rejected'
  eventRequest.reviewedBy = req.user._id
  eventRequest.reviewedAt = new Date()
  eventRequest.reviewNotes = reviewNotes || 'Request rejected'
  await eventRequest.save()

  const populatedRequest = await EventRequest.findById(eventRequest._id)
    .populate('requestedBy', 'name email')
    .populate('reviewedBy', 'name email')

  // Emit socket notification
  if (req.io) {
    req.io.to(`user:${eventRequest.requestedBy._id}`).emit('event-request-rejected', {
      message: `Your event request "${eventRequest.eventName}" was rejected`,
      eventRequest: populatedRequest,
    })
  }

  res.json(populatedRequest)
})

// @desc    Delete event request (Student can delete their own pending requests)
// @route   DELETE /api/event-requests/:id
// @access  Private
export const deleteEventRequest = asyncHandler(async (req, res) => {
  const eventRequest = await EventRequest.findById(req.params.id)

  if (!eventRequest) {
    res.status(404)
    throw new Error('Event request not found')
  }

  // Students can only delete their own pending requests
  if (req.user.role === 'Student' && eventRequest.requestedBy.toString() !== req.user._id.toString()) {
    res.status(403)
    throw new Error('Not authorized to delete this request')
  }

  if (eventRequest.status !== 'pending' && req.user.role === 'Student') {
    res.status(400)
    throw new Error('Cannot delete a reviewed request')
  }

  await eventRequest.deleteOne()

  res.json({ message: 'Event request deleted' })
})
