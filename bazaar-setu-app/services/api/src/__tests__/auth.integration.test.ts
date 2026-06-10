import type { Server } from "node:http";
import type { Express } from "express";
import express from "express";
import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

process.env.NODE_ENV = "test";
process.env.DEMO_AUTH_ENABLED = "false";
process.env.JWT_SECRET = "test-jwt-secret-with-more-than-thirty-two-characters";
process.env.OTP_CODE_PEPPER = "test-otp-pepper-with-more-than-thirty-two-characters";
process.env.ADMIN_BOOTSTRAP_TOKEN = "test-bootstrap-token-with-more-than-thirty-two-characters";
process.env.OTP_PROVIDER_URL = "https://otp.test/send";
process.env.OTP_PROVIDER_API_KEY = "otp-provider-key";
process.env.RATE_LIMIT_MAX = "1000";
process.env.RATE_LIMIT_WINDOW_MS = "60000";

type StoredUser = {
  id: string;
  role: "CUSTOMER" | "SELLER" | "ADMIN" | "SUPPORT";
  name: string;
  phone: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
};

type StoredOtp = {
  id: string;
  phone: string;
  role: StoredUser["role"];
  codeHash: string;
  providerMessageId?: string;
  attempts: number;
  expiresAt: Date;
  consumedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type StoredSession = {
  id: string;
  userId: string;
  refreshTokenHash: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
  revokedAt?: Date | null;
  lastUsedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

const mockStore = vi.hoisted(() => {
  const users = new Map<string, StoredUser>();
  const customers = new Map<string, { id: string; userId: string; rewardPoints: number }>();
  const sellers = new Map<string, { id: string; userId: string; ownerName: string; shopName: string }>();
  const otpChallenges = new Map<string, StoredOtp>();
  const sessions = new Map<string, StoredSession>();
  let sequence = 1;

  function nextId(prefix: string) {
    sequence += 1;
    return `${prefix}-${sequence}`;
  }

  function findUser(where: { id?: string; phone?: string }) {
    return Array.from(users.values()).find((user) => {
      if (where.id) return user.id === where.id;
      if (where.phone) return user.phone === where.phone;
      return false;
    });
  }

  const prisma = {
    otpChallenge: {
      create: vi.fn(async ({ data }: { data: Partial<StoredOtp> }) => {
        const now = new Date();
        const challenge: StoredOtp = {
          id: nextId("otp"),
          phone: data.phone!,
          role: data.role!,
          codeHash: data.codeHash!,
          providerMessageId: data.providerMessageId,
          attempts: data.attempts ?? 0,
          expiresAt: data.expiresAt!,
          consumedAt: data.consumedAt ?? null,
          createdAt: now,
          updatedAt: now
        };
        otpChallenges.set(challenge.id, challenge);
        return challenge;
      }),
      findFirst: vi.fn(async ({ where, orderBy }: { where: Record<string, any>; orderBy?: Record<string, string> }) => {
        let matches = Array.from(otpChallenges.values()).filter((challenge) => {
          if (where.id && challenge.id !== where.id) return false;
          if (where.phone && challenge.phone !== where.phone) return false;
          if (where.role && challenge.role !== where.role) return false;
          if (where.consumedAt === null && challenge.consumedAt) return false;
          if (where.expiresAt?.gt && challenge.expiresAt <= where.expiresAt.gt) return false;
          return true;
        });
        if (orderBy?.createdAt === "desc") {
          matches = matches.sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
        }
        return matches[0] ?? null;
      }),
      update: vi.fn(async ({ where, data }: { where: { id: string }; data: Record<string, any> }) => {
        const challenge = otpChallenges.get(where.id);
        if (!challenge) throw new Error("OTP challenge not found");
        if (data.attempts?.increment) challenge.attempts += data.attempts.increment;
        if ("providerMessageId" in data) challenge.providerMessageId = data.providerMessageId;
        if ("consumedAt" in data) challenge.consumedAt = data.consumedAt;
        challenge.updatedAt = new Date();
        return challenge;
      })
    },
    user: {
      findUnique: vi.fn(async ({ where, include }: { where: { id?: string; phone?: string }; include?: Record<string, boolean> }) => {
        const user = findUser(where);
        if (!user) return null;
        if (!include) return user;
        return {
          ...user,
          customerProfile: customers.get(user.id) ?? null,
          sellerProfile: sellers.get(user.id) ?? null
        };
      }),
      upsert: vi.fn(async ({ where, update, create }: { where: { phone: string }; update: Partial<StoredUser>; create: Partial<StoredUser> }) => {
        const existing = findUser(where);
        if (existing) {
          Object.assign(existing, update, { updatedAt: new Date() });
          return existing;
        }
        const now = new Date();
        const user: StoredUser = {
          id: nextId("user"),
          role: create.role!,
          name: create.name!,
          phone: create.phone!,
          email: create.email,
          createdAt: now,
          updatedAt: now
        };
        users.set(user.id, user);
        return user;
      }),
      count: vi.fn(async ({ where }: { where?: { role?: StoredUser["role"] } }) =>
        Array.from(users.values()).filter((user) => (!where?.role ? true : user.role === where.role)).length
      )
    },
    customerProfile: {
      upsert: vi.fn(async ({ where, create }: { where: { userId: string }; create: { userId: string } }) => {
        const existing = customers.get(where.userId);
        if (existing) return existing;
        const profile = { id: nextId("customer"), userId: create.userId, rewardPoints: 0 };
        customers.set(create.userId, profile);
        return profile;
      })
    },
    sellerProfile: {
      upsert: vi.fn(async ({ where, create }: { where: { userId: string }; create: { userId: string; ownerName: string; shopName: string } }) => {
        const existing = sellers.get(where.userId);
        if (existing) return existing;
        const profile = { id: nextId("seller"), userId: create.userId, ownerName: create.ownerName, shopName: create.shopName };
        sellers.set(create.userId, profile);
        return profile;
      })
    },
    authSession: {
      create: vi.fn(async ({ data }: { data: Partial<StoredSession> }) => {
        const now = new Date();
        const session: StoredSession = {
          id: nextId("session"),
          userId: data.userId!,
          refreshTokenHash: data.refreshTokenHash!,
          userAgent: data.userAgent,
          ipAddress: data.ipAddress,
          expiresAt: data.expiresAt!,
          revokedAt: data.revokedAt ?? null,
          lastUsedAt: now,
          createdAt: now,
          updatedAt: now
        };
        sessions.set(session.id, session);
        return session;
      }),
      findUnique: vi.fn(async ({ where, include }: { where: { id?: string; refreshTokenHash?: string }; include?: { user?: boolean } }) => {
        const session = Array.from(sessions.values()).find((item) => {
          if (where.id) return item.id === where.id;
          if (where.refreshTokenHash) return item.refreshTokenHash === where.refreshTokenHash;
          return false;
        });
        if (!session) return null;
        if (include?.user) return { ...session, user: findUser({ id: session.userId })! };
        return session;
      }),
      update: vi.fn(async ({ where, data }: { where: { id: string }; data: Partial<StoredSession> }) => {
        const session = sessions.get(where.id);
        if (!session) throw new Error("Session not found");
        Object.assign(session, data, { updatedAt: new Date() });
        return session;
      }),
      updateMany: vi.fn(async ({ where, data }: { where: Record<string, any>; data: Partial<StoredSession> }) => {
        let count = 0;
        for (const session of sessions.values()) {
          if (where.userId && session.userId !== where.userId) continue;
          if (where.refreshTokenHash && session.refreshTokenHash !== where.refreshTokenHash) continue;
          if (where.revokedAt === null && session.revokedAt) continue;
          Object.assign(session, data, { updatedAt: new Date() });
          count += 1;
        }
        return { count };
      })
    }
  };

  function reset() {
    users.clear();
    customers.clear();
    sellers.clear();
    otpChallenges.clear();
    sessions.clear();
    sequence = 1;
    vi.clearAllMocks();
  }

  return { prisma, reset, users };
});

vi.mock("../db.js", () => ({ prisma: mockStore.prisma }));

let createApp: typeof import("../app.js").createApp;
let rateLimit: typeof import("../middleware.js").rateLimit;
let lastOtp = "";

beforeAll(async () => {
  ({ createApp } = await import("../app.js"));
  ({ rateLimit } = await import("../middleware.js"));
});

beforeEach(() => {
  mockStore.reset();
  lastOtp = "";
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body ?? "{}")) as { otp?: string };
      lastOtp = body.otp ?? "";
      return new Response(JSON.stringify({ messageId: "otp-provider-message" }), { status: 200 });
    })
  );
});

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

describe("auth API integration", () => {
  it("starts OTP, verifies customer login, refreshes, and logs out", async () => {
    const { agent, close } = await createTestAgent(createApp());

    try {
    const start = await agent
      .post("/api/auth/otp/start")
      .send({ phone: "+919900000001", role: "CUSTOMER" })
      .expect(200);

    expect(start.body.data.requestId).toBeTruthy();
    expect(lastOtp).toMatch(/^\d{6}$/);

    const verified = await agent
      .post("/api/auth/otp/verify")
      .send({ phone: "+919900000001", role: "CUSTOMER", requestId: start.body.data.requestId, otp: lastOtp, name: "Test Customer" })
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

  it("bootstraps the first admin and lets admin provision support users", async () => {
    const { agent, close } = await createTestAgent(createApp());

    try {
    await agent
      .post("/api/auth/admin/bootstrap")
      .set("x-admin-bootstrap-token", process.env.ADMIN_BOOTSTRAP_TOKEN!)
      .send({ phone: "+919900000010", name: "Ops Admin", email: "admin@bazaarsetu.test" })
      .expect(201);

    await agent
      .post("/api/auth/admin/bootstrap")
      .set("x-admin-bootstrap-token", process.env.ADMIN_BOOTSTRAP_TOKEN!)
      .send({ phone: "+919900000011", name: "Second Admin" })
      .expect(409);

    const start = await agent
      .post("/api/auth/otp/start")
      .send({ phone: "+919900000010", role: "ADMIN" })
      .expect(200);

    const login = await agent
      .post("/api/auth/otp/verify")
      .send({ phone: "+919900000010", role: "ADMIN", requestId: start.body.data.requestId, otp: lastOtp })
      .expect(200);

    await agent
      .post("/api/admin/staff-users")
      .set("Authorization", `Bearer ${login.body.data.accessToken}`)
      .send({ phone: "+919900000012", name: "Support Agent", email: "support@bazaarsetu.test", role: "SUPPORT" })
      .expect(201);

    expect(Array.from(mockStore.users.values()).some((user) => user.role === "SUPPORT")).toBe(true);
    } finally {
      await close();
    }
  });

  it("blocks unprovisioned admin OTP login", async () => {
    const { agent, close } = await createTestAgent(createApp());

    try {
    await agent
      .post("/api/auth/otp/start")
      .send({ phone: "+919900000099", role: "ADMIN" })
      .expect(403);
    } finally {
      await close();
    }
  });

  it("rate limits repeated requests", async () => {
    const app = express();
    app.set("trust proxy", 1);
    app.use(rateLimit("auth-spec", 2, 60_000));
    app.get("/limited", (_req, res) => res.json({ ok: true }));
    const { agent, close } = await createTestAgent(app);

    try {
    await agent.get("/limited").set("x-forwarded-for", "10.10.10.10").expect(200);
    await agent.get("/limited").set("x-forwarded-for", "10.10.10.10").expect(200);
    const limited = await agent.get("/limited").set("x-forwarded-for", "10.10.10.10").expect(429);

    expect(limited.headers["x-ratelimit-store"]).toBe("memory");
    expect(limited.headers["retry-after"]).toBeTruthy();
    } finally {
      await close();
    }
  });
});
