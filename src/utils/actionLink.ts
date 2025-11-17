/* eslint-disable @typescript-eslint/no-unused-vars */
// src/utils/actionLink.ts
import crypto from "crypto";

const SECRET = process.env.JWT_SECRET || "change_this_secret";
const BASE =
  process.env.ACTION_BASE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000";

/**
 * payload: proposalId|actorId|role|action|expiry
 * token = base64url(payload|sig)
 */
export function generateActionToken({
  proposalId,
  actorId,
  role, // "signer" | "approver"
  action, // "approve" | "reject"
  expiresInSeconds = 60 * 60 * 24, // default 24h
}: {
  proposalId: string | number;
  actorId: string | number;
  role: "signer" | "approver";
  action: "approve" | "reject";
  expiresInSeconds?: number;
}) {
  const expiry = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const payload = `${proposalId}|${actorId}|${role}|${action}|${expiry}`;
  const sig = crypto
    .createHmac("sha256", SECRET)
    .update(payload)
    .digest("base64url");
  const token = Buffer.from(`${payload}|${sig}`).toString("base64url");

  const confirmUrl = `${BASE}/api/proposals/email-action?token=${encodeURIComponent(
    token
  )}`;
  const directApi = `${BASE}/api/proposals/email-action?token=${encodeURIComponent(
    token
  )}&direct=1`; // optional one-click
  return { token, confirmUrl, directApi, expiresAt: new Date(expiry * 1000) };
}

export function verifyActionToken(tokenBase64: string) {
  try {
    const raw = Buffer.from(tokenBase64, "base64url").toString("utf8");
    const parts = raw.split("|");
    if (parts.length < 6) return null;
    const sig = parts.pop()!;
    const expiry = Number(parts[4]);
    const payload = parts.join("|");
    const expected = crypto
      .createHmac("sha256", SECRET)
      .update(payload)
      .digest("base64url");

    // timing safe compare
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)))
      return null;
    if (Date.now() / 1000 > expiry) return null;

    const [proposalId, actorId, role, action] = parts;
    return {
      proposalId: Number(proposalId),
      actorId: Number(actorId),
      role,
      action,
      expiry,
    };
  } catch (err) {
    return null;
  }
}
