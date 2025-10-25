import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { reportItem, listItems, updateItemStatus } from '../controllers/lostFoundController.js'

const router = Router()

// POST /api/lost-found/report (auth required)
router.post('/report', requireAuth, reportItem)
// GET /api/lost-found (public)
router.get('/', listItems)
// PUT /api/lost-found/:id (auth required; owner or Admin)
router.put('/:id', requireAuth, updateItemStatus)

export default router
