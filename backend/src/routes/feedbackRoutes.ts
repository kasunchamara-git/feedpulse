import express from 'express';
import { submitFeedback, getAllFeedback, updateFeedbackStatus, deleteFeedback } from '../controllers/feedbackController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/', submitFeedback);           // public
router.get('/', protect, getAllFeedback);   // admin only
router.patch('/:id', protect, updateFeedbackStatus); // admin only
router.delete('/:id', protect, deleteFeedback);      // admin only

export default router;