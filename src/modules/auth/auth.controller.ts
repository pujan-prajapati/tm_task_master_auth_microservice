import { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service.js";
import asyncHandler from "express-async-handler";

// register user
export const registerUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, username, email, password, phone } = req.body;
    const newUser = await authService.registerUser({
      name,
      username,
      email,
      password,
      phone,
    });

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: newUser,
    });
  },
);

// login user
export const loginUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const { accessToken, refreshToken, user } = await authService.loginUser({
      email,
      password,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env["NODE_ENV"] === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      status: "success",
      message: "User logged in successfully",
      data: user,
      accessToken: accessToken,
    });
  },
);

// refresh token
export const refreshToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const oldToken = req.cookies["refreshToken"];
    if (!oldToken) {
      throw new Error("Refresh token not found");
    }

    const { accessToken, refreshToken } =
      await authService.refreshToken(oldToken);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env["NODE_ENV"] === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      status: "success",
      message: "Token refreshed successfully",
      token: accessToken,
    });
  },
);

// get user profile
export const getUserProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.user;

    const user = await authService.getUserProfile(id);

    res.status(200).json({
      status: "success",
      message: "User profile fetched successfully",
      data: user,
    });
  },
);

// get user by ID (internal service endpoint)
export const getUserById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = Number(req.params.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
      res.status(400).json({
        status: "error",
        message: "Invalid user ID",
      });
      return;
    }

    const user = await authService.getUserProfile(userId);

    res.status(200).json({
      status: "success",
      message: "User fetched successfully",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  },
);
