import express from "express";
import type { Express } from "express";

export function createApplication(): Express {
  const app = express();

  // Middleware

  // routes
  app.get("/health", (req, res) => {
    res.json({ message: "health route test" });
  });

  return app;
}
