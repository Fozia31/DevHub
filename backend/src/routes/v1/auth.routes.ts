// backend/src/routes/v1/auth.routes.ts
import express from 'express';
import { protect } from '../../middleware/auth.middleware';
import { getProfile, login, updateProfile,logout,register } from '../../controllers/auth.controller';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/profile', protect, getProfile);
router.patch('/profile', protect, updateProfile);

export default router;