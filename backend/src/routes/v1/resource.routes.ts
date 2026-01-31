// backend/src/routes/v1/resource.routes.ts
import express from 'express';
import { addResource, getResources,updateResourceStatus } from '../../controllers/userresource.controller';
import { protect, authorize } from '../../middleware/auth.middleware';

const router = express.Router();

router.get('/', protect, getResources);
router.post('/add', protect, authorize('admin'), addResource);
router.patch('/:id/status', protect, updateResourceStatus); // The new route

export default router;