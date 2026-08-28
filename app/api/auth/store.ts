/**
 * Auth store — in-memory user/session registry for the demo.
 *
 * This keeps register/login/reset actually working end-to-end without a
 * running database. When DATABASE_URL + Prisma are configured, swap the
 * internals for `prisma.user.create(...)` etc. — the request/response contract
 * below stays stable (see prisma/schema.prisma).
 */
import { createHash, randomBytes } from "crypto";

interface StoredUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  passwordHash: string; // sha256(email + ":" + password)
  createdAt: number;
}

interface StoredSession {
  token: string;
  userId: string;
  expiresAt: number;
}

// Module-level (survives for the lifetime of the server process).
const G = globalThis as unknown as {
  __pdUsers?: Map<string, StoredUser>;
  __pdSessions?: Map<string, StoredSession>;
};

const users: Map<string, StoredUser> = G.__pdUsers ?? (G.__pdUsers = new Map());
const sessions: Map<string, StoredSession> = G.__pdSessions ?? (G.__pdSessions = new Map());

// Seed a demo user so the login flow works end-to-end without a database.
if (!users.has("demo@placedesk.com")) {
  users.set("demo@placedesk.com", {
    id: "user_demo",
    email: "demo@placedesk.com",
    firstName: "Sarah",
    lastName: "Johnson",
    passwordHash: hashPassword("demo1234"),
    createdAt: Date.now(),
  });
}

export function hashPassword(password: string): string {
  return createHash("sha256").update(`${password}`).digest("hex");
}

export function makeToken(): string {
  return randomBytes(28).toString("hex");
}

export function createUser(input: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}) {
  const email = input.email.toLowerCase().trim();
  if (users.has(email)) return { error: "email-in-use" } as const;
  const user: StoredUser = {
    id: randomBytes(9).toString("hex"),
    email,
    firstName: input.firstName,
    lastName: input.lastName,
    passwordHash: hashPassword(input.password),
    createdAt: Date.now(),
  };
  users.set(email, user);
  return { user } as const;
}

export function verifyLogin(email: string, password: string) {
  const user = users.get(email.toLowerCase().trim());
  if (!user) return { error: "invalid-credentials" } as const;
  if (user.passwordHash !== hashPassword(password))
    return { error: "invalid-credentials" } as const;
  return { user } as const;
}

export function openSession(userId: string): StoredSession {
  const session: StoredSession = {
    token: makeToken(),
    userId,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
  };
  sessions.set(session.token, session);
  return session;
}

export function readUserForToken(token: string) {
  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now()) return null;
  for (const user of users.values()) {
    if (user.id === session.userId) return user;
  }
  return null;
}

export function destroySession(token: string) {
  sessions.delete(token);
}

export function setPassword(email: string, password: string) {
  const user = users.get(email.toLowerCase().trim());
  if (!user) return false;
  user.passwordHash = hashPassword(password);
  return true;
}

export function emailExists(email: string) {
  return users.has(email.toLowerCase().trim());
}

/** Public-safe shape of a user (never exposes hash/password). */
export function publicUser(user: StoredUser) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
  };
}