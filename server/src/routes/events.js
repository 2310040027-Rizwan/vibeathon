import { Router } from 'express'
import { requireAuth, authorizeRoles } from '../middleware/auth.js'
import { createEvent, listEvents, updateEvent, deleteEvent } from '../controllers/eventsController.js'

const router = Router()

// Only Faculty and Admin can create/update/delete
router.post('/', requireAuth, authorizeRoles('Faculty', 'Admin'), createEvent)
router.get('/', listEvents)
router.put('/:id', requireAuth, authorizeRoles('Faculty', 'Admin'), updateEvent)
router.delete('/:id', requireAuth, authorizeRoles('Faculty', 'Admin'), deleteEvent)

export default router
