// pages/api/tiktok/init-url.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "../../../lib/session";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getSession(req, res);
  const token = session.user?.access_token;
  if (!token) return res.status(401).json({ error: "not_authenticated" });

  const { video_url, title } = req.body ?? {};
  if (!video_url) return res.status(400).json({ error: "missing_video_url" });

  try {
    const r = await fetch("https://open.tiktokapis.com/v2/post/publish/inbox/video/init/", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        source_info: {
          source: "PULL_FROM_URL",
          video_url,                 // URL https publique (ton domaine vérifié ou CDN)
        },
        post_mode: { mode: "DRAFT" }, // brouillon
        title: title?.toString().slice(0, 150) ?? undefined,
      }),
    });

    const raw = await r.text();
    if (!r.ok) {
      return res.status(r.status).json({ error: "init_failed", raw: raw.slice(0, 500) });
    }

    const data = JSON.parse(raw);
    const payload = data.data ?? data;
    // TikTok renvoie souvent request_id + upload_id / task_id
    return res.status(200).json({
      ok: true,
      request_id: payload.request_id ?? data.request_id,
      upload_id:  payload.upload_id  ?? payload.task_id,
      raw: payload,
    });
  } catch (e: any) {
    return res.status(500).json({ error: "init_crash", message: e?.message });
  }
}
