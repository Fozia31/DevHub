// backend/src/routes/v1/auth.routes.ts
import express from 'express';
import { register, login , getProfile ,updateProfile, logout} from '../../controllers/auth.controller';
import { protect } from '../../middleware/auth.middleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/profile', protect, getProfile);
router.patch('/profile', protect, updateProfile);

export default router;