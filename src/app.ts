import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler, notFound } from "./middlewares/error.middleware.js";
import authRouter from "./modules/auth/auth.route.js";

const app = express();

app.use(
  cors({
    origin: process.env["CORS_ORIGIN"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// routes
app.use("/api/auth", authRouter);

// custom middleware
app.use(notFound);
app.use(errorHandler);

export default app;
