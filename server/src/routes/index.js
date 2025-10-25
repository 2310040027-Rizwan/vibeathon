import { Router } from 'express';
import authRouter from './auth.js';
import lostFoundRouter from './lostFound.js';
import eventsRouter from './events.js';
import eventRequestsRouter from './eventRequests.js';
import feedbackRouter from './feedback.js';
import chatbotRouter from './chatbot.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/lost-found', lostFoundRouter);
router.use('/events', eventsRouter);
router.use('/event-requests', eventRequestsRouter);
router.use('/feedback', feedbackRouter);
router.use('/chatbot', chatbotRouter);

export default router;
