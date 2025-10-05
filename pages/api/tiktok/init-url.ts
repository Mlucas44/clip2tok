// pages/api/tiktok/init-url.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "../../../lib/session";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getSession(req, res);
  const token = session.user?.access_token;
  if (!token) return res.status(401).json({ error: "not_authenticated" });

  // 1) si un publish_id est encore en cours, renvoyer celui-ci
  if (session.last_publish_id) {
    return res.status(200).json({
      ok: true,
      publish_id: session.last_publish_id,
      already_in_progress: true,
    });
  }

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
        source_info: { source: "PULL_FROM_URL", video_url },
        post_mode: { mode: "DRAFT" },
        title: title?.toString().slice(0, 150),
      }),
    });

    const raw = await r.text();
    if (!r.ok) {
      // TikTok renvoie un JSON avec error.code/message
      try {
        const err = JSON.parse(raw);
        const code = err?.error?.code;
        if (code === "spam_risk_too_many_pending_share") {
          return res.status(429).json({
            error: "too_many_pending",
            message:
              "TikTok limite le nombre d’uploads en attente. Attendez que l’envoi actuel se termine puis réessayez.",
            tiktok: err,
          });
        }
      } catch {}
      return res.status(r.status).json({ error: "init_failed", raw: raw.slice(0, 600) });
    }

    const data = JSON.parse(raw);
    const payload = data.data ?? data;

    // 2) stocker publish_id en session pour bloquer les doublons
    session.last_publish_id = payload.publish_id;
    await session.save();

    return res.status(200).json({
      ok: true,
      publish_id: payload.publish_id,
      raw: payload,
    });
  } catch (e: any) {
    return res.status(500).json({ error: "init_crash", message: e?.message });
  }
}
