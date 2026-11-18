import type { User, UserLoginData } from "./auth.types.js";
import { db } from "../../config/db.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { comparePassword, hashPassword } from "../../utils/hash.js";
import { or } from "@prisma/orm-postgres/orm-client";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";

// register user
export const registerUser = async (userData: User) => {
  const user = await db.orm.public.User.where((u) =>
    or(
      u.email.eq(userData.email),
      u.username.eq(userData.username),
      u.phone.eq(userData.phone),
    ),
  ).first();

  if (user) {
    throw new AppError("User already exists", 409);
  }

  const hashedPassword = await hashPassword(userData.password);

  const newUser = await db.orm.public.User.create({
    name: userData.name,
    username: userData.username,
    email: userData.email,
    hash_password: hashedPassword,
    phone: userData.phone,
  });

  return {
    id: newUser.id,
    name: newUser.name,
    username: newUser.username,
    email: newUser.email,
    phone: newUser.phone,
    role: newUser.role,
  };
};

// login user
export const loginUser = async (userData: UserLoginData) => {
  if (!userData.email || !userData.password) {
    throw new AppError("Email and password are required", 400);
  }
  const user = await db.orm.public.User.first({ email: userData.email });

  if (!user) {
    throw new AppError("Invalid Credentials", 401);
  }

  const valid = await comparePassword(userData.password, user.hash_password);
  if (!valid) {
    throw new Error("Invalid Credentials");
  }

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await db.orm.public.RefreshToken.create({
    token: refreshToken,
    user_id: user.id,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  };
};

// refresh token
export const refreshToken = async (oldToken: string) => {
  const decoded = verifyRefreshToken(oldToken) as any;

  const storedToken = await db.orm.public.RefreshToken.first({
    token: oldToken,
  });
  if (!storedToken) {
    throw new AppError("Invalid Refresh Token", 401);
  }

  if (storedToken?.user_id !== decoded.id) {
    throw new AppError("Token-user mismatch", 401);
  }

  if (storedToken.expires_at < new Date()) {
    await db.orm.public.RefreshToken.where({ token: oldToken }).delete();
    throw new AppError("Refresh Token Expired", 401);
  }

  // --- REFRESH TOKEN ROTATION ---
  // 1. Delete the old token
  await db.orm.public.RefreshToken.where({ token: oldToken }).delete();

  // 2. Generate new pair
  const payload = { id: decoded.id, email: decoded.email, role: decoded.role };
  const newAccessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);

  // 3. Store the new refresh token
  await db.orm.public.RefreshToken.create({
    token: newRefreshToken,
    user_id: decoded.id,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

// get user profile
export const getUserProfile = async (userId: number) => {
  const user = await db.orm.public.User.first({ id: userId });
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
};
