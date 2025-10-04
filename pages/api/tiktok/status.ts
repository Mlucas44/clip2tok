// pages/api/tiktok/status.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "../../../lib/session";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req, res);
  const token = session.user?.access_token;
  if (!token) return res.status(401).json({ error: "not_authenticated" });

  const upload_id = (req.query.upload_id || req.body?.upload_id)?.toString();
  if (!upload_id) return res.status(400).json({ error: "missing_upload_id" });

  try {
    const r = await fetch(`https://open.tiktokapis.com/v2/post/publish/inbox/video/query/?upload_id=${encodeURIComponent(upload_id)}`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` },
    });

    const raw = await r.text();
    if (!r.ok) return res.status(r.status).json({ error: "status_failed", raw: raw.slice(0, 500) });

    const data = JSON.parse(raw);
    return res.status(200).json({ ok: true, data });
  } catch (e: any) {
    return res.status(500).json({ error: "status_crash", message: e?.message });
  }
}
