// backend/src/middleware/auth.middleware.ts
import { Response, Request, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Note: Ensure you have 'cookie-parser' installed and used in server.ts
    const token = req.cookies?.token; 

    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }

    try {
        // Fix 1: Added 'role' to the decoded type cast
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string, role: string };
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Not authorized, token failed" });
    }
}

export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        // Fix 2: Check if req.user exists before checking the role
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `User role ${req.user?.role || 'unknown'} is not authorized` 
            });
        };
        next();
    };
};