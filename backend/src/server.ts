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

// Middleware
app.use(cookieParser());
app.use(express.json());

// CORS Configuration
const allowedOrigins = [
  'https://dev-hub-lac-ten.vercel.app', 
  'http://localhost:3000',               
  'http://127.0.0.1:3000'               
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`CORS Error: Origin ${origin} not allowed`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ['Content-Type', 'Authorization', 'set-cookie']
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/tasks', adminTaskRoutes);
app.use('/api/resources', resourceRoutes);

app.get('/health', (req, res) => res.status(200).send('Server is healthy'));

// Migration logic
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

// Start Server properly
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect to Database first
    await connectDB();
    console.log("✅ MongoDB Connected");

    // 2. Start Listening
    app.listen(PORT, async () => {
      console.log(`🚀 Server running on port ${PORT}`);
      
      // 3. Run migration in production after DB is ready
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