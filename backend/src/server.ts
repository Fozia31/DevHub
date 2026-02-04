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
import { createTask } from './controllers/admintask.controller.js';
dotenv.config();
const app = express();
// When running behind a proxy (e.g. Render, Heroku), enable trust proxy
// so that Express correctly detects secure connections and related behaviors.
app.set('trust proxy', 1);
const __dirname = dirname(fileURLToPath(import.meta.url));

// 1. Core Middleware
app.use(express.json());
app.use(cookieParser());

const defaultFrontend = process.env.FRONTEND_URL || 'http://localhost:3000';

// This dynamic origin function is the problem for cross-domain cookies
app.use(cors({
  origin:defaultFrontend,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Optional debug logging for auth routes to diagnose cookie/CORS issues in production.
if (process.env.DEBUG_COOKIE_LOG === 'true') {
  app.use((req, _res, next) => {
    if (req.path.startsWith('/api/auth')) {
      console.log('CORS/COOKIE DEBUG ->', req.method, req.path, 'Origin:', req.headers.origin, 'Host:', req.headers.host);
    }
    next();
  });
}

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/resources', Res); 
app.use('/api/admin/tasks', taskAdminRoutes); 
app.use('/api/admin/tasks/add', createTask); 

app.use
app.use('/api/admin/resources', adminResourceRoutes); 

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