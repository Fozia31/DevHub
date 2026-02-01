import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, github, leetcode } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'student',
      codingHandles: {
        github: github || '',
        leetcode: leetcode || ''
      }
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: true, 
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000 
    });

    res.json({
      message: 'Login successful',
      user: { id: user._id, name: user.name, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const logout = (req: Request, res: Response) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0), 
    sameSite: 'none',
    secure: true
  });
  
  res.status(200).json({ message: "Logged out successfully" });
};

export const getProfile = async (req: any, res: Response) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateProfile = async (req: any, res: Response) => {
  try {
    const { name, title, github, leetcode, linkedin, telegram, codeforces } = req.body;
    const userId = req.user.id || req.user._id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          name, 
          title, 
          "codingHandles.github": github,
          "codingHandles.leetcode": leetcode,
          "codingHandles.linkedin": linkedin,
          "codingHandles.telegram": telegram,
          "codingHandles.codeforces": codeforces
        } 
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile" });
  }
};