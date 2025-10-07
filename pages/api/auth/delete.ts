// pages/api/auth/delete.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "../../../lib/session";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const session = await getSession(req, res);
  try {
    delete (session as any).last_publish_id;
    delete (session as any).user;
    await session.save?.();
    await session.destroy?.();
  } catch {}
  res.status(200).json({ ok: true, message: "Deleted" });
}
