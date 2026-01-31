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
  status: { 
  type: String, 
  enum: ['Active', 'Draft', 'Completed'], // Added 'Completed'
  default: 'Active' 
},
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  type: { type: String, enum: ['link', 'video', 'pdf'], default: 'link' },
  content: String, // URL or File path
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' }
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);