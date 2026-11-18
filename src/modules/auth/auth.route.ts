import { Router } from "express";
import {
  getUserById,
  getUserProfile,
  loginUser,
  refreshToken,
  registerUser,
} from "./auth.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { serviceMiddleware } from "../../middlewares/service.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshToken);

router.route("/get-user-profile").get(authMiddleware, getUserProfile);
router.route("/users/:userId").get(serviceMiddleware, getUserById);

export default router;
