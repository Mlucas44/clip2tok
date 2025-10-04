// pages/api/tiktok/status.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "../../../lib/session";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req, res);
  const token = session.user?.access_token;
  if (!token) return res.status(401).json({ error: "not_authenticated" });

  // accepte GET ?publish_id=... ou POST { publish_id }
  const publish_id =
    (req.query.publish_id as string) ||
    (typeof req.body === "object" && (req.body as any).publish_id);

  if (!publish_id) {
    return res.status(400).json({ error: "missing_publish_id" });
  }

  try {
    const r = await fetch(
      "https://open.tiktokapis.com/v2/post/publish/inbox/video/query/",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({ publish_id }),
      }
    );

    const raw = await r.text();
    if (!r.ok) {
      return res
        .status(r.status)
        .json({ error: "status_failed", raw: raw.slice(0, 800) });
    }

    const data = JSON.parse(raw);
    return res.status(200).json({ ok: true, data });
  } catch (e: any) {
    return res.status(500).json({ error: "status_crash", message: e?.message });
  }
}
