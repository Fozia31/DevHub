// backend/src/routes/v1/resource.routes.ts
import express from 'express';
import { addResource, getResources, updateResourceStatus } from '../../controllers/userresource.controller';
import { protect, authorize } from '../../middleware/auth.middleware';
import { deleteResource, updateResource } from '../../controllers/adminresource.controller';

const router = express.Router();

router.get('/', protect, getResources);
router.post('/add', protect, authorize('admin'), addResource);
router.put('/:id', protect, authorize('admin'), updateResource);
router.delete('/:id', protect, authorize('admin'), deleteResource);
router.patch('/:id/status', protect, updateResourceStatus); // Only one entry needed

export default router;