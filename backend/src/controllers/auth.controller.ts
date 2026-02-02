import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Extend Express Request to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        email: string;
        _id?: string;
      };
    }
  }
}

const getCookieOptions = () => {
    const isProd = process.env.NODE_ENV === 'production';

    const options: any = {
        httpOnly: true,
        secure: isProd, 
        sameSite: isProd ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        path: '/',
    };

    // In production, only set cookie domain when explicitly configured.
    // Setting domain implicitly (derived from FRONTEND_URL) can cause mismatches
    // and rejected cookies. Provide `COOKIE_DOMAIN` like `.example.com` when needed.
    if (isProd && process.env.COOKIE_DOMAIN) {
        options.domain = process.env.COOKIE_DOMAIN;
    }

    return options;
};

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, role, github, leetcode } = req.body;
        
        // Validate required fields
        if (!name || !email || !password) {
            res.status(400).json({ 
                message: 'Name, email, and password are required' 
            });
            return;
        }
        
        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400).json({ 
                message: 'Email already registered' 
            });
            return;
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
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error: any) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            message: 'Registration failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            res.status(400).json({ 
                message: 'Email and password are required' 
            });
            return;
        }
        
        const user = await User.findOne({ email });
        
        if (!user) {
            res.status(401).json({ 
                message: 'Invalid email or password' 
            });
            return;
        }
        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            res.status(401).json({ 
                message: 'Invalid email or password' 
            });
            return;
        }

        const token = jwt.sign(
            { 
                id: user._id.toString(), 
                role: user.role,
                email: user.email
            },
            process.env.JWT_SECRET || 'fallback_secret_key_change_in_production',
            { expiresIn: '1d' }
        );

        // Set cookie with proper configuration
        const cookieOptions = getCookieOptions();
        res.cookie('token', token, cookieOptions);

        // Debug logging
        console.log('=== LOGIN DEBUG ===');
        console.log('User:', user.email);
        console.log('Cookie options:', cookieOptions);
        console.log('Environment:', process.env.NODE_ENV);
        console.log('Frontend URL:', process.env.FRONTEND_URL);
        console.log('===================');

        res.json({
            message: 'Login successful',
            user: { 
                id: user._id, 
                name: user.name, 
                role: user.role,
                email: user.email 
            },
            // Return token in response so frontend can also store it in localStorage
            token,
            cookieSet: true
        });
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Server error during login',
            error: process.env.NODE_ENV === 'production' ? error.message : undefined
        });
    }
};

export const logout = (req: Request, res: Response): void => {
    try {
        const cookieOptions = getCookieOptions();
        
        // Clear the cookie with matching options
        res.clearCookie('token', cookieOptions);
        
        console.log('User logged out');
        
        res.status(200).json({ 
            message: "Logged out successfully" 
        });
    } catch (error: any) {
        console.error('Logout error:', error);
        res.status(500).json({ 
            message: "Logout failed" 
        });
    }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id || req.user?._id;
        
        if (!userId) {
            res.status(401).json({ 
                message: "Not authenticated" 
            });
            return;
        }
        
        const user = await User.findById(userId).select('-password');
        
        if (!user) {
            res.status(404).json({ 
                message: "User not found" 
            });
            return;
        }
        
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            codingHandles: user.codingHandles,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        });
    } catch (error: any) {
        console.error('Get profile error:', error);
        res.status(500).json({ 
            message: "Server Error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id || req.user?._id;
        
        if (!userId) {
            res.status(401).json({ 
                message: "Not authenticated" 
            });
            return;
        }
        
        // Prevent role change via this endpoint
        const { role, password, ...updateData } = req.body;
        
        if (role) {
            res.status(400).json({ 
                message: "Role cannot be changed via this endpoint" 
            });
            return;
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData }, 
            { 
                new: true, 
                runValidators: true 
            }
        ).select('-password');
        
        if (!updatedUser) {
            res.status(404).json({ 
                message: "User not found" 
            });
            return;
        }
        
        res.json({
            message: "Profile updated successfully",
            user: updatedUser
        });
    } catch (error: any) {
        console.error('Update profile error:', error);
        res.status(500).json({ 
            message: "Update failed",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Add this endpoint for testing auth
export const checkAuth = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ 
                message: "Not authenticated" 
            });
            return;
        }
        
        res.json({
            authenticated: true,
            user: {
                id: req.user.id,
                role: req.user.role,
                email: req.user.email
            },
            cookies: req.cookies,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('Check auth error:', error);
        res.status(500).json({ 
            message: "Auth check failed" 
        });
    }
};

// Add a debug endpoint
export const debugLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('=== DEBUG LOGIN REQUEST ===');
        console.log('Body:', req.body);
        console.log('Headers:', req.headers);
        console.log('Cookies:', req.cookies);
        console.log('Environment:', process.env.NODE_ENV);
        console.log('JWT Secret exists:', !!process.env.JWT_SECRET);
        console.log('============================');
        
        // Try to process the login normally
        await login(req, res);
    } catch (error: any) {
        console.error('Debug login error:', error);
        res.status(500).json({
            message: 'Debug login failed',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};