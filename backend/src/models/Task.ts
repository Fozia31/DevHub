// backend/src/models/Task.ts
import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  module: {
     type: String,
    required: true
 },
 student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  status: { 
  type: String, 
  enum: ['Active', 'Draft', 'Completed'], 
  default: 'Active' 
},
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  type: { type: String, enum: ['link', 'video', 'pdf'], default: 'link' },
  content: String, 
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' }
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);