import express from 'express';
import { getStudentTasks, getTaskStats, updateTaskStatus } from '../../controllers/usertask.controller';

const router = express.Router();

router.get('/stats', getTaskStats);
router.get('/student/tasks', getStudentTasks);

router.patch('/:id/update', updateTaskStatus);

export default router;