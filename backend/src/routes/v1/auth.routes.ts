// backend/src/routes/v1/auth.routes.ts
import express from 'express';
import { protect } from '../../middleware/auth.middleware';
import { 
  getProfile, 
  login, 
  updateProfile, 
  logout, 
  register,
  debugLogin
} from '../../controllers/auth.controller';


const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.post('/logout', protect, logout);
router.get('/profile', protect, getProfile);
router.patch('/profile', protect, updateProfile);
router.post('/debug-login', debugLogin);

router.get('/test-cookie', (req: express.Request, res: express.Response) => {
  const cookieOptions: any = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    path: '/',
  };
  
  // Add domain only in production for Render
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.domain = '.onrender.com';
  }
  
  // Set test cookie
  res.cookie('test_auth_cookie', 'cookie_is_working', cookieOptions);
  
  res.json({
    message: 'Test cookie set successfully',
    cookies_received: req.cookies,
    cookie_options: cookieOptions,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});


export default router;