import express from 'express';
import { getStudentTasks, getTaskStats, updateTaskStatus } from '../../controllers/usertask.controller';

const router = express.Router();

router.get('/stats', getTaskStats);
router.get('/student/tasks', getStudentTasks);

// Matches: PATCH http://localhost:5000/api/tasks/:id/update
router.patch('/:id/update', updateTaskStatus);

export default router;