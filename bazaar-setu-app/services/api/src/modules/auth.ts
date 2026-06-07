import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { config } from "../config.js";
import { prisma } from "../db.js";

export const authRouter = Router();

const startOtpSchema = z.object({
  phone: z.string().min(10),
  role: z.enum(["CUSTOMER", "SELLER", "ADMIN", "SUPPORT"]).default("CUSTOMER")
});

authRouter.post("/otp/start", async (req, res) => {
  const input = startOtpSchema.parse(req.body);
  // TODO: Replace demo OTP with MSG91/Gupshup/Twilio provider.
  res.json({ ok: true, data: { requestId: `otp-${Date.now()}`, demoOtp: "123456", phone: input.phone, role: input.role } });
});

authRouter.post("/otp/verify", async (req, res) => {
  const input = startOtpSchema.extend({ otp: z.string().length(6), name: z.string().optional() }).parse(req.body);
  if (input.otp !== "123456") return res.status(401).json({ ok: false, error: "Invalid OTP" });

  const user = await prisma.user.upsert({
    where: { phone: input.phone },
    update: { role: input.role },
    create: { phone: input.phone, role: input.role, name: input.name ?? "Bazaar Setu User" }
  });

  const token = jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, { expiresIn: "30d" });
  res.json({ ok: true, data: { token, user } });
});
