import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const header = req.headers.authorization;

  // 1. Check if header exists and starts with "Bearer "
  if (!header || !header.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "No token provided or invalid format" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token) as any;

    // 2. Attach the decoded payload to the request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    // 3. Return 401 specifically so the frontend knows to try a /refresh
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
