import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const isProduction = process.env.NODE_ENV === 'production';

// Centralized cookie configuration for consistency
const cookieOptions = {
    httpOnly: true,
    secure: true, // Always true for Render/Vercel HTTPS
    sameSite: 'none' as const, // Required for cross-site cookies
    maxAge: 24 * 60 * 60 * 1000 // 1 day
};

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role, github, leetcode } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'Email already registered' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name, email, password: hashedPassword,
            role: role || 'student',
            codingHandles: { github: github || '', leetcode: leetcode || '' }
        });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Registration failed' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );

        res.cookie('token', token, cookieOptions);

        res.json({
            message: 'Login successful',
            user: { id: user._id, name: user.name, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const logout = (req: Request, res: Response) => {
    // Clear the cookie by setting an expired date
    res.cookie('token', '', { 
        ...cookieOptions, 
        expires: new Date(0),
        maxAge: 0 
    });
    res.status(200).json({ message: "Logged out successfully" });
};

export const getProfile = async (req: any, res: Response) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const user = await User.findById(userId).select('-password');
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

export const updateProfile = async (req: any, res: Response) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { ...req.body } }, // Ensure body keys match schema
            { new: true, runValidators: true }
        ).select('-password');
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: "Update failed" });
    }
};