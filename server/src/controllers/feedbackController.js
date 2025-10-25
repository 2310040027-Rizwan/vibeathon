import asyncHandler from 'express-async-handler'
import Feedback from '../models/Feedback.js'
import { emitGlobal } from '../sockets/index.js'

export const submitFeedback = asyncHandler(async (req, res) => {
  const { subject, message } = req.body
  if (!subject || !message) return res.status(400).json({ message: 'subject and message are required' })
  const fb = await Feedback.create({ subject, message, submittedBy: req.user._id })
  emitGlobal(req.app, 'notify', { title: 'New Feedback', description: subject })
  res.status(201).json(fb)
})

export const listFeedback = asyncHandler(async (req, res) => {
  const all = await Feedback.find().sort({ createdAt: -1 }).populate('submittedBy', 'name email')
  res.json(all)
})

export const updateFeedbackStatus = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { status } = req.body
  if (!['pending', 'resolved'].includes(status)) return res.status(400).json({ message: 'Invalid status' })
  const fb = await Feedback.findByIdAndUpdate(id, { status }, { new: true })
  if (!fb) return res.status(404).json({ message: 'Feedback not found' })
  emitGlobal(req.app, 'notify', { title: 'Feedback Updated', description: `${fb.subject} → ${fb.status}` })
  res.json(fb)
})
