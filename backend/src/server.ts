import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import connectDB from './config/db.js'; 
import authRoutes from './routes/v1/auth.routes.js';
import taskRoutes from './routes/v1/task.routes.js';
import adminRoutes from './routes/v1/admin.routes.js';
import resourceRoutes from './routes/v1/resource.routes.js';
import adminTaskRoutes from './routes/v1/admin.task.routes.js';

import Task from './models/Task.js';
import User from './models/User.js';

dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ========== MIDDLEWARE ==========
app.use(cookieParser());
app.use(express.json());

// ========== CORS CONFIGURATION ==========
const allowedOrigin = 'https://dev-hub-lac-ten.vercel.app';

// CORS middleware with exposed headers
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Set-Cookie'],
  exposedHeaders: ['Set-Cookie', 'Authorization'], // CRITICAL: Expose Set-Cookie
  maxAge: 86400
}));

// Explicit CORS headers for pre-flight and response
app.use((req, res, next) => {
  // Set headers for all responses
  res.header('Access-Control-Allow-Origin', allowedOrigin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, Set-Cookie');
  res.header('Access-Control-Expose-Headers', 'Set-Cookie, Authorization'); // EXPOSE Set-Cookie
  
  // Handle pre-flight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// ========== STATIC FILES ==========
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

// ========== ROUTES ==========
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/tasks', adminTaskRoutes);
app.use('/api/resources', resourceRoutes);

// ========== TEST ENDPOINTS ==========
app.get('/health', (req, res) => res.status(200).json({ 
  status: 'healthy',
  timestamp: new Date().toISOString(),
  environment: process.env.NODE_ENV
}));

// Test cookie endpoint - FIXED for cross-origin
app.get('/api/test-cookie', (req, res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: true, // Always true in production
    sameSite: 'none', // Must be 'none' for cross-origin
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  };
  
  // Remove domain setting for cross-origin cookies
  // cookieOptions.domain = '.onrender.com'; // Comment out or remove
  
  res.cookie('test_cookie', 'cookie_is_working', cookieOptions);
  
  res.json({ 
    message: 'Test cookie set successfully',
    cookies_received: req.cookies,
    cookie_options: cookieOptions,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Debug endpoint to check headers
app.get('/api/debug-headers', (req, res) => {
  console.log('Request headers:', req.headers);
  console.log('Request cookies:', req.cookies);
  
  res.json({
    requestHeaders: req.headers,
    requestCookies: req.cookies,
    serverTime: new Date().toISOString()
  });
});

// ========== MIGRATION LOGIC ==========
const runMigration = async () => {
  try {
    const student = await User.findOne({ role: 'student' });
    if (student) {
      const result = await Task.updateMany(
        { student: { $exists: false } }, 
        { $set: { student: student._id } }
      );
      if (result.modifiedCount > 0) {
        console.log(`✅ Migration: Linked ${result.modifiedCount} orphan tasks`);
      }
    }
  } catch (err) {
    console.error("❌ Migration failed:", err);
  }
};

// ========== ERROR HANDLING ==========
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect to Database first
    await connectDB();
    console.log("✅ MongoDB Connected");

    // 2. Start Listening
    app.listen(PORT, async () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
      console.log(`🔧 CORS configured for: ${allowedOrigin}`);
      
      if (process.env.NODE_ENV === 'production') {
        await runMigration(); 
      }
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();