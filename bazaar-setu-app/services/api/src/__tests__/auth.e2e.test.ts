import type { Server } from "node:http";
import type { Express } from "express";
import express from "express";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const runE2E = process.env.RUN_E2E === "true";
const describeE2E = runE2E ? describe : describe.skip;

if (runE2E) {
  process.env.NODE_ENV = "test";
  process.env.DEMO_AUTH_ENABLED = "false";
  process.env.JWT_SECRET ||= "e2e-jwt-secret-with-more-than-thirty-two-characters";
  process.env.OTP_CODE_PEPPER ||= "e2e-otp-pepper-with-more-than-thirty-two-characters";
  process.env.ADMIN_BOOTSTRAP_TOKEN ||= "e2e-bootstrap-token-with-more-than-thirty-two-characters";
  process.env.OTP_PROVIDER_URL ||= "https://otp.test/send";
  process.env.OTP_PROVIDER_API_KEY ||= "e2e-otp-provider-key";
  process.env.RATE_LIMIT_MAX ||= "1000";
  process.env.RATE_LIMIT_WINDOW_MS ||= "60000";
}

let createApp: typeof import("../app.js").createApp;
let rateLimit: typeof import("../middleware.js").rateLimit;
let prisma: typeof import("../db.js").prisma;
let closeRateLimitStore: typeof import("../rate-limit-store.js").closeRateLimitStore;
let sentOtps: Map<string, string>;

const e2ePrefix = "+199986";
const runSuffix = String(Date.now()).slice(-5);
const phones = {
  customer: `${e2ePrefix}${runSuffix}01`,
  admin: `${e2ePrefix}${runSuffix}02`,
  support: `${e2ePrefix}${runSuffix}03`,
  unprovisionedAdmin: `${e2ePrefix}${runSuffix}04`
};

async function createTestAgent(app: Express) {
  const server = await new Promise<Server>((resolve, reject) => {
    const candidate = app.listen(0, "127.0.0.1", () => resolve(candidate));
    candidate.on("error", reject);
  });

  return {
    agent: request(server),
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      })
  };
}

async function cleanupE2EData() {
  const matchingUsers = await prisma.user.findMany({
    where: {
      OR: [
        { phone: { startsWith: e2ePrefix } },
        { email: { endsWith: "@e2e.bazaarsetu.test" } }
      ]
    },
    select: { id: true }
  });
  const userIds = matchingUsers.map((user) => user.id);

  if (userIds.length) {
    await prisma.authSession.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.customerProfile.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.sellerProfile.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  }

  await prisma.otpChallenge.deleteMany({ where: { phone: { startsWith: e2ePrefix } } });
  await prisma.sellerLead.deleteMany({ where: { phone: { startsWith: e2ePrefix } } });
}

beforeAll(async () => {
  if (!runE2E) return;
  ({ createApp } = await import("../app.js"));
  ({ rateLimit } = await import("../middleware.js"));
  ({ prisma } = await import("../db.js"));
  ({ closeRateLimitStore } = await import("../rate-limit-store.js"));

  sentOtps = new Map();
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body ?? "{}")) as { phone?: string; otp?: string; requestId?: string };
      if (body.phone && body.otp) sentOtps.set(body.phone, body.otp);
      return new Response(JSON.stringify({ messageId: `e2e-${body.requestId ?? "otp"}` }), {
        status: 200,
        headers: { "content-type": "application/json" }
      });
    })
  );

  await cleanupE2EData();
});

beforeEach(() => {
  if (!runE2E) return;
  sentOtps.clear();
});

afterAll(async () => {
  if (!runE2E) return;
  await cleanupE2EData();
  closeRateLimitStore();
  await prisma.$disconnect();
});

describeE2E("auth API E2E with Postgres and Redis", () => {
  it("verifies customer OTP login, refresh rotation, me, and logout", async () => {
    const { agent, close } = await createTestAgent(createApp());

    try {
      const start = await agent
        .post("/api/auth/otp/start")
        .send({ phone: phones.customer, role: "CUSTOMER" })
        .expect(200);

      const otp = sentOtps.get(phones.customer);
      expect(otp).toMatch(/^\d{6}$/);

      const verified = await agent
        .post("/api/auth/otp/verify")
        .send({
          phone: phones.customer,
          role: "CUSTOMER",
          requestId: start.body.data.requestId,
          otp,
          name: "E2E Customer"
        })
        .expect(200);

      expect(verified.body.data.accessToken).toBeTruthy();
      expect(verified.body.data.refreshToken).toBeTruthy();
      expect(verified.body.data.customerProfile.id).toBeTruthy();

      await agent
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${verified.body.data.accessToken}`)
        .expect(200);

      const refreshed = await agent
        .post("/api/auth/refresh")
        .send({ refreshToken: verified.body.data.refreshToken })
        .expect(200);

      expect(refreshed.body.data.refreshToken).not.toEqual(verified.body.data.refreshToken);

      await agent
        .post("/api/auth/refresh")
        .send({ refreshToken: verified.body.data.refreshToken })
        .expect(401);

      await agent
        .post("/api/auth/logout")
        .send({ refreshToken: refreshed.body.data.refreshToken })
        .expect(200);

      await agent
        .post("/api/auth/refresh")
        .send({ refreshToken: refreshed.body.data.refreshToken })
        .expect(401);
    } finally {
      await close();
    }
  });

  it("bootstraps first admin, logs in through OTP, and provisions support", async () => {
    const { agent, close } = await createTestAgent(createApp());

    try {
      await agent
        .post("/api/auth/admin/bootstrap")
        .set("x-admin-bootstrap-token", process.env.ADMIN_BOOTSTRAP_TOKEN!)
        .send({ phone: phones.admin, name: "E2E Ops Admin", email: "admin@e2e.bazaarsetu.test" })
        .expect(201);

      await agent
        .post("/api/auth/admin/bootstrap")
        .set("x-admin-bootstrap-token", process.env.ADMIN_BOOTSTRAP_TOKEN!)
        .send({ phone: `${e2ePrefix}${runSuffix}99`, name: "Second Admin" })
        .expect(409);

      const start = await agent
        .post("/api/auth/otp/start")
        .send({ phone: phones.admin, role: "ADMIN" })
        .expect(200);

      const login = await agent
        .post("/api/auth/otp/verify")
        .send({
          phone: phones.admin,
          role: "ADMIN",
          requestId: start.body.data.requestId,
          otp: sentOtps.get(phones.admin)
        })
        .expect(200);

      await agent
        .post("/api/admin/staff-users")
        .set("Authorization", `Bearer ${login.body.data.accessToken}`)
        .send({ phone: phones.support, name: "E2E Support", email: "support@e2e.bazaarsetu.test", role: "SUPPORT" })
        .expect(201);

      const support = await prisma.user.findUnique({ where: { phone: phones.support } });
      expect(support?.role).toBe("SUPPORT");
    } finally {
      await close();
    }
  });

  it("blocks unprovisioned admin OTP login", async () => {
    const { agent, close } = await createTestAgent(createApp());

    try {
      await agent
        .post("/api/auth/otp/start")
        .send({ phone: phones.unprovisionedAdmin, role: "ADMIN" })
        .expect(403);
    } finally {
      await close();
    }
  });

  it("uses Redis for API rate limiting", async () => {
    const app = express();
    app.set("trust proxy", 1);
    app.use(rateLimit(`auth-e2e-${runSuffix}`, 2, 60_000));
    app.get("/limited", (_req, res) => res.json({ ok: true }));

    const { agent, close } = await createTestAgent(app);

    try {
      await agent.get("/limited").set("x-forwarded-for", `10.20.${runSuffix.slice(-2)}.1`).expect(200);
      await agent.get("/limited").set("x-forwarded-for", `10.20.${runSuffix.slice(-2)}.1`).expect(200);
      const limited = await agent.get("/limited").set("x-forwarded-for", `10.20.${runSuffix.slice(-2)}.1`).expect(429);

      expect(limited.headers["x-ratelimit-store"]).toBe("redis");
      expect(limited.headers["retry-after"]).toBeTruthy();
    } finally {
      await close();
    }
  });
});
