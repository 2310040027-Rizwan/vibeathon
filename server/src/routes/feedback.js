import { Router } from 'express'
import { requireAuth, authorizeRoles } from '../middleware/auth.js'
import { submitFeedback, listFeedback, updateFeedbackStatus } from '../controllers/feedbackController.js'

const router = Router()

router.post('/', requireAuth, submitFeedback)
router.get('/', requireAuth, authorizeRoles('Admin'), listFeedback)
router.put('/:id', requireAuth, authorizeRoles('Admin'), updateFeedbackStatus)

export default router
