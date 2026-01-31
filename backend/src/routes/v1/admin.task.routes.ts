import express from 'express';
import multer from 'multer';
import fs from 'fs'; 
import { createTask, getTasks, deleteTask, getTaskStats } from '../../controllers/admintask.controller';
import { protect, authorize } from '../../middleware/auth.middleware';

const router = express.Router();

const uploadDir = 'uploads/tasks/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Use the variable here
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// All routes here are for Admin only
router.use(protect, authorize('admin'));

router.get('/', getTasks);
router.get('/stats', getTaskStats);
router.post('/add', upload.single('file'), createTask); // 'file' matches frontend key
router.delete('/:id', deleteTask);

export default router;