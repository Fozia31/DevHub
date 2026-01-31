import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/v1/auth.routes';
import connectDB from './config/db';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import taskRoutes from './routes/v1/task.routes';
import adminRoutes from './routes/v1/admin.routes';
import resourceRoutes from './routes/v1/resource.routes';
import adminTaskRoutes from './routes/v1/admin.task.routes';

dotenv.config();
connectDB();

const app = express();
app.use(cors({
  origin: 'http://localhost:3000', // Your Frontend URL
  credentials: true,                // Allows cookies/JWT to be sent
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use('/uploads', express.static(path.join(__dirname, '../uploads/tasks')));
app.use(cookieParser());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/tasks', adminTaskRoutes);
app.use('/api/resources', resourceRoutes);
const PORT = process.env.PORT || 5000;

app.get('/api/test', (req, res) => {
  res.json({ message: "Server is running!" });
});

app.listen(PORT, () =>{
    console.log(`Server is running on port ${PORT}`);
})