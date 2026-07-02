import cors, { type CorsOptions } from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config.js";
import { errorHandler, notFoundHandler } from "./http.js";
import { authOptional, requestContext } from "./middleware.js";
import { adminRouter } from "./modules/admin.js";
import { authRouter } from "./modules/auth.js";
import { catalogueRouter } from "./modules/catalogue.js";
import { customerRouter } from "./modules/customer.js";
import { healthRouter } from "./modules/health.js";
import { sellerRouter } from "./modules/seller.js";

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || config.corsOrigins.includes("*") || config.corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
  credentials: true
};

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(express.json({ limit: config.requestBodyLimit }));
  app.use(requestContext);
  app.use(morgan(config.isProduction ? "combined" : "dev", { skip: (req) => req.path === "/api/health" }));
  app.use(authOptional);

  app.use("/api", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/catalogue", catalogueRouter);
  app.use("/api/customer", customerRouter);
  app.use("/api/seller", sellerRouter);
  app.use("/api/admin", adminRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
