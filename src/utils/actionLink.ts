/* eslint-disable @typescript-eslint/no-unused-vars */
// src/utils/actionLink.ts
import crypto from "crypto";

const SECRET = process.env.JWT_SECRET || "change_this_secret";
const BASE =
  process.env.ACTION_BASE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000";

/**
 * payload: proposalId|actorId|role|action|expiry
 * token = base64url(payload|sig)
 */
export function generateActionToken({
  proposalId,
  actorId,
  role,
  action,
  expiresInSeconds = 60 * 60 * 24, // 24h
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

  const confirmUrl = `${BASE}/api/proposals/email-action?token-hrm=${encodeURIComponent(
    token
  )}`;
  const directApi = `${confirmUrl}&direct=1`;

  return {
    token,
    confirmUrl,
    directApi,
    expiresAt: new Date(expiry * 1000),
  };
}

/**
 * Verify token from email
 */
export function verifyActionToken(tokenBase64: string) {
  try {
    const raw = Buffer.from(tokenBase64, "base64url").toString("utf8");
    const parts = raw.split("|");

    if (parts.length !== 6) return null;

    const [proposalId, actorId, role, action, expiryStr, sig] = parts;

    const expiry = Number(expiryStr);
    if (!expiry) return null;

    // ✅ thời gian (seconds)
    if (Date.now() / 1000 > expiry) {
      return null;
    }

    const payload = `${proposalId}|${actorId}|${role}|${action}|${expiry}`;

    const expectedSig = crypto
      .createHmac("sha256", SECRET)
      .update(payload)
      .digest("base64url");

    // ✅ so sánh an toàn – KHÔNG throw
    if (
      sig.length !== expectedSig.length ||
      !crypto.timingSafeEqual(
        Buffer.from(sig, "utf8"),
        Buffer.from(expectedSig, "utf8")
      )
    ) {
      return null;
    }

    return {
      proposalId: Number(proposalId),
      actorId: Number(actorId),
      role: role as "signer" | "approver",
      action: action as "approve" | "reject",
      expiry,
    };
  } catch (err) {
    console.error("[verifyActionToken]", err);
    return null;
  }
}
