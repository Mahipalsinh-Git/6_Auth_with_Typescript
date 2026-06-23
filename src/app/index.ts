import express from "express";
import type { Express } from "express";
import { authRouter } from "./auth/routes.js";

export function createApplication(): Express {
  const app = express();

  // Middleware
  app.use(express.json());

  // routes
  app.get("/health", (req, res) => {
    res.json({ message: "health route test" });
  });

  app.use("/auth", authRouter);

  return app;
}
