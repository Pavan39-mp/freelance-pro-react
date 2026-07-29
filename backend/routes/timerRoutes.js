import express from 'express';
import { protect, authorizeRoles } from '../middleware/auth.js';
import { 
    startTimer,
    stopTimer,
    addManualEntry,
    editEntry,
    deleteEntry,
    getTaskSessions,
    getActiveSession,
    getTimeSummary
} from '../controllers/timerController.js';

const router = express.Router();

router.use(protect, authorizeRoles('freelancer'));

router.post('/start', startTimer);
router.put('/:id/stop', stopTimer);
router.post('/manual', addManualEntry);
router.put('/:id', editEntry);
router.delete('/:id', deleteEntry);
router.get('/task/:taskId', getTaskSessions);
router.get('/active', getActiveSession);
router.get('/summary', getTimeSummary);

export default router;
