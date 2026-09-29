import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export function normalizeCode(value: unknown) {
  return String(value ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
}

export function cleanText(value: unknown, max = 80) {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, max);
}

export function newAccessToken() {
  return randomBytes(24).toString("hex");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function isAdmin(password: unknown) {
  const expected = process.env.QUIZ_ADMIN_PASSWORD;
  if (!expected || typeof password !== "string") return false;
  const receivedBuffer = Buffer.from(password);
  const expectedBuffer = Buffer.from(expected);
  return receivedBuffer.length === expectedBuffer.length && timingSafeEqual(receivedBuffer, expectedBuffer);
}

export function apiError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}
