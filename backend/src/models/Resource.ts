// src/models/Resource.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IResource extends Document {
  title: string;
  description?: string;
  type: 'video' | 'pdf' | 'link';
  url: string;
  category: string;
  status: 'Not Started' | 'In-Progress' | 'Done' | 'Need-Help'; // Added this
  createdBy: mongoose.Types.ObjectId; // Interface expects ObjectId
  metadata?: { // Add this if you want to use it
    duration?: string;
    size?: string;
  };
}

const ResourceSchema = new Schema<IResource>({
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['video', 'pdf', 'link'], required: true },
  url: { type: String, required: true },
  category: { type: String, default: 'General' },
  status: { 
    type: String, 
    enum: ['Not Started', 'In-Progress', 'Done', 'Need-Help'], 
    default: 'Not Started' 
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model<IResource>('Resource', ResourceSchema);