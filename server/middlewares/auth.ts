import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: Missing token" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthRequest["user"];
    
    if (!decoded || !decoded.id) {
        return res.status(401).json({ error: "Unauthorized: Invalid token payload" });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!dbUser) {
        return res.status(401).json({ error: "Unauthorized: User no longer exists" });
    }

    req.user = {
        id: dbUser.id,
        role: dbUser.role,
        email: dbUser.email
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  const roleLower = req.user?.role?.toLowerCase() || "";
  if (roleLower !== "admin" && roleLower !== "super_admin" && roleLower !== "demo_admin") {
    return res.status(403).json({ error: "Forbidden: Admin access required" });
  }
  next();
};

export const requireSuperAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  const roleLower = req.user?.role?.toLowerCase() || "";
  if (roleLower !== "super_admin") {
    return res.status(403).json({ error: "Forbidden: Super Admin access required" });
  }
  next();
};
