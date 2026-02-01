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

connectDB();

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:3000',
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 
app.use(cookieParser());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/tasks', adminTaskRoutes);
app.use('/api/resources', resourceRoutes);

app.get('/health', (req, res) => res.status(200).send('Server is healthy'));

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    if (process.env.NODE_ENV === 'production') {
      runMigration();
    }
});