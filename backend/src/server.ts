import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Route Imports (Ensure these paths match your project)
import authRoutes from './routes/v1/auth.routes.js';
import taskRoutes from './routes/v1/task.routes.js';
import adminRoutes from './routes/v1/admin.routes.js';
import connectDB from './config/db.js';
import Res from './routes/v1/resource.routes.js';
import taskAdminRoutes from './routes/v1/admin.task.routes.js';
import adminResourceRoutes from './routes/v1/admin.resource.routes.js';
dotenv.config();
const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

// 1. Core Middleware
app.use(express.json());
app.use(cookieParser());

// 2. Optimized CORS (No manual res.header blocks needed)
// Use an explicit origin when `credentials: true` is required.
const defaultFrontend = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(cors({
  origin: (origin, callback) => {
    // If no origin (e.g. direct server-to-server requests or same-origin),
    // fall back to the configured default frontend. Otherwise echo the
    // request origin so the browser receives an explicit Access-Control-Allow-Origin.
    if (!origin) return callback(null, defaultFrontend);
    return callback(null, origin);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// 3. Static Files & Routes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/resources', Res); // Assuming resources are handled in adminRoutes
app.use('/api/admin/tasks', taskAdminRoutes); // Admin-specific task routes
app.use('/api/admin/resources', adminResourceRoutes); // Admin-specific resource routes

// 4. Health Check
app.get('/health', (req, res) => res.status(200).json({ status: 'healthy' }));

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
  } catch (err: any) {
    console.error('Failed to start server:', err.message || err);
    process.exit(1);
  }
};

start();