// backend/src/models/User.ts
import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['admin', 'student'], 
    default: 'student' 
  },
  title: { 
    type: String, 
    default: 'web developer' 
  },
  codingHandles: {
  github: { type: String, default: '' },
  leetcode: { type: String, default: '' },
  linkedin: { type: String, default: '' },  
  telegram: { type: String, default: '' }, 
  codeforces: { type: String, default: '' }, 
},
  attendance: { 
    type: Number, 
    default: 0 
  },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
export default User;