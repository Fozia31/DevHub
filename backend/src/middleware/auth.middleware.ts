// backend/src/middleware/auth.middleware.ts
import { Response, Request, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Export the interface so you can use it in your controllers
export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    // 1. Check for token in cookies
    const token = req.cookies?.token; 

    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }

    try {
        // 2. Safely verify token
        const secret = process.env.JWT_SECRET || 'secret'; 
        
        
        const decoded = jwt.verify(token, secret) as { id: string; role: string };
        
        // 3. Attach user to request object
        req.user = {
            id: decoded.id,
            role: decoded.role
        };
        
        next();
    } catch (error) {
        console.error("JWT Verification Error:", error);
        return res.status(401).json({ message: "Not authorized, token failed" });
    }
}

export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        // Ensure user exists and role matches
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `User role ${req.user?.role || 'unknown'} is not authorized to access this route` 
            });
        };
        next();
    };
};