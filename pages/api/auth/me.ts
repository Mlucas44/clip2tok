// pages/api/auth/me.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "../../../lib/session";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req, res);
  const user = session?.user || {};
  const open_id = user.open_id ?? user.openId ?? null;
  const scopes = Array.isArray(user.scopes)
    ? user.scopes
    : typeof user.scope === "string"
      ? user.scope.split(/[ ,]+/).filter(Boolean)
      : [];

  res.status(200).json({
    open_id,
    scopes,
    last_publish_id: session.last_publish_id ?? null,
  });
}
