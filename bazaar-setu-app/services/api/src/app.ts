import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { authOptional } from "./middleware.js";
import { adminRouter } from "./modules/admin.js";
import { authRouter } from "./modules/auth.js";
import { catalogueRouter } from "./modules/catalogue.js";
import { customerRouter } from "./modules/customer.js";
import { healthRouter } from "./modules/health.js";
import { sellerRouter } from "./modules/seller.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "2mb" }));
  app.use(morgan("dev"));
  app.use(authOptional);

  app.use("/api", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/catalogue", catalogueRouter);
  app.use("/api/customer", customerRouter);
  app.use("/api/seller", sellerRouter);
  app.use("/api/admin", adminRouter);

  app.use((_req, res) => res.status(404).json({ ok: false, error: "Route not found" }));

  return app;
}
