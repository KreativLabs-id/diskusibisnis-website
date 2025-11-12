import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

export const authenticateToken = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        res.status(401).json({ success: false, message: 'Access token required' });
        return;
    }

    jwt.verify(token, process.env.JWT_SECRET || '', (err, decoded) => {
        if (err) {
            res.status(403).json({ success: false, message: 'Invalid or expired token' });
            return;
        }

        req.user = decoded as { id: string; email: string; role: string };
        next();
    });
};

export const requireAdmin = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
    }

    if (req.user.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Admin access required' });
        return;
    }

    next();
};

export const optionalAuth = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        next();
        return;
    }

    jwt.verify(token, process.env.JWT_SECRET || '', (err, decoded) => {
        if (!err && decoded) {
            req.user = decoded as { id: string; email: string; role: string };
        }
        next();
    });
};
