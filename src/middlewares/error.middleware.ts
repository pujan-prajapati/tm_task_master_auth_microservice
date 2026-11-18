import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

//not found
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found : ${req.originalUrl}`);
  res.status(404);
  next(error);
};

//error handler
export const errorHandler = (
  err: Error & { statusCode?: number },
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode =
    err.statusCode ?? (res.statusCode === 200 ? 500 : res.statusCode);
  res.status(statusCode);
  res.json({
    success: false,
    message: err.message,
    data: null,
  });
};
