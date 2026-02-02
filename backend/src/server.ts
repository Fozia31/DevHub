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

dotenv.config();
const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

// 1. Core Middleware
app.use(express.json());
app.use(cookieParser());

// 2. Optimized CORS (No manual res.header blocks needed)
const allowedOrigin = 'https://dev-hub-lac-ten.vercel.app';

app.use(cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));

// 3. Static Files & Routes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin', adminRoutes);

// 4. Health Check
app.get('/health', (req, res) => res.status(200).json({ status: 'healthy' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));