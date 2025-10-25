import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import {
  submitEventRequest,
  getEventRequests,
  approveEventRequest,
  rejectEventRequest,
  deleteEventRequest,
} from '../controllers/eventRequestController.js'

const router = express.Router()

router.route('/').post(requireAuth, submitEventRequest).get(requireAuth, getEventRequests)

router.route('/:id/approve').put(requireAuth, approveEventRequest)

router.route('/:id/reject').put(requireAuth, rejectEventRequest)

router.route('/:id').delete(requireAuth, deleteEventRequest)

export default router
