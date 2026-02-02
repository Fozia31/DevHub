import express from 'express';
import { getAllResources, addResource, updateResource, deleteResource } from '../../controllers/adminresource.controller';
import { protect, authorize } from '../../middleware/auth.middleware';

const router = express.Router();

// All admin resource routes require admin role
router.use(protect, authorize('admin'));

router.get('/', getAllResources);
router.post('/add', addResource);
router.put('/:id', updateResource);
router.delete('/:id', deleteResource);

export default router;
