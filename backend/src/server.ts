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

// ========== SIMPLE CORS CONFIGURATION ==========
const allowedOrigins = [
  'https://dev-hub-lac-ten.vercel.app', 
  'http://localhost:3000',               
  'http://127.0.0.1:3000'               
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Set-Cookie', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));

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

// Test cookie endpoint
app.get('/api/test-cookie', (req, res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  };
  
  // Set domain only in production for Render
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.domain = '.onrender.com';
  }
  
  res.cookie('test_cookie', 'cookie_is_working', cookieOptions);
  
  res.json({ 
    message: 'Test cookie set successfully',
    cookies_received: req.cookies,
    cookie_options: cookieOptions,
    timestamp: new Date().toISOString()
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