import type { Request, Response, NextFunction } from "express";

export const serviceMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const serviceSecret = req.headers["x-service-secret"];

  if (
    !process.env["FASTAPI_SERVICE_SECRET"] ||
    serviceSecret !== process.env["FASTAPI_SERVICE_SECRET"]
  ) {
    return res.status(403).json({
      status: "error",
      message: "Forbidden: Invalid service credentials",
    });
  }

  next();
};
