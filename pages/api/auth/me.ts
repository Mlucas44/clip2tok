// pages/api/auth/me.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "../../../lib/session";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ✅ Anti-cache (super important)
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  const session = await getSession(req, res);
  const user = session.user ?? {};

  const open_id = (user.open_id ?? user.openId ?? null) as string | null;

  const scopes = Array.isArray(user.scopes)
    ? user.scopes
    : typeof user.scope === "string"
      ? user.scope.split(/[ ,]+/).filter(Boolean)
      : [];

  // ✅ Expiration check (si tu as expires_at)
  const expiresAt = user.expires_at;
  const isExpired =
    typeof expiresAt === "number" && expiresAt > 0
      ? Date.now() >= expiresAt // (si expires_at est en secondes -> Date.now()/1000)
      : false;

  if (!open_id || isExpired) {
    // si expiré, on nettoie la session
    if (isExpired) await session.destroy();

    return res.status(200).json({
      open_id: null,
      scopes: [],
      last_publish_id: null,
      expired: isExpired,
    });
  }

  return res.status(200).json({
    open_id,
    scopes,
    last_publish_id: session.last_publish_id ?? null,
    expired: false,
  });
}
