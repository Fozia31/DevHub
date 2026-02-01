// backend/src/routes/v1/admin.routes.ts
import express from 'express';
import { getAdminStats } from '../../controllers/admin.controller';
import { protect, authorize } from '../../middleware/auth.middleware';
import { addResource, getAllResources } from '../../controllers/adminresource.controller';

const router = express.Router();

router.get('/dashboard', protect, authorize('admin'), getAdminStats);
router.get('/stats', protect, authorize('admin'), getAdminStats);
router.post('/resources/add', protect, authorize('admin'), addResource);
router.get('/resources', protect, authorize('admin'), getAllResources);

export default router;