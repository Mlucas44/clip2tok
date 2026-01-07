// pages/api/tiktok/init-file.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "../../../lib/session";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const cid = (req.headers["x-correlation-id"] as string) || "no-cid";
  const session = await getSession(req, res);
  const token = session.user?.access_token;

  if (!token) {
    console.warn({ cid }, "init-file: not_authenticated");
    return res.status(401).json({ error: "not_authenticated" });
  }

  // Vérifier si un upload est déjà en cours
  if (session.last_publish_id) {
    console.info({ cid, publish_id: session.last_publish_id }, "init-file: already_in_progress");
    return res.status(200).json({
      ok: true,
      publish_id: session.last_publish_id,
      already_in_progress: true,
    });
  }

  const { video_size, chunk_size, total_chunk_count, title } = req.body ?? {};

  // Validation stricte: caster en Number et vérifier que ce sont des entiers positifs
  const videoSize = Number(video_size);
  const chunkSize = Number(chunk_size);
  const totalChunkCount = Number(total_chunk_count);

  if (!Number.isInteger(videoSize) || videoSize <= 0) {
    console.warn({ cid, video_size }, "init-file: invalid_video_size");
    return res.status(400).json({
      error: "invalid_video_size",
      message: "video_size must be a positive integer"
    });
  }

  if (!Number.isInteger(chunkSize) || chunkSize <= 0) {
    console.warn({ cid, chunk_size }, "init-file: invalid_chunk_size");
    return res.status(400).json({
      error: "invalid_chunk_size",
      message: "chunk_size must be a positive integer"
    });
  }

  if (!Number.isInteger(totalChunkCount) || totalChunkCount <= 0) {
    console.warn({ cid, total_chunk_count }, "init-file: invalid_total_chunk_count");
    return res.status(400).json({
      error: "invalid_total_chunk_count",
      message: "total_chunk_count must be a positive integer"
    });
  }

  // Vérifier la cohérence mathématique: total_chunk_count = ceil(video_size / chunk_size)
  const expectedChunkCount = Math.ceil(videoSize / chunkSize);
  if (totalChunkCount !== expectedChunkCount) {
    console.warn(
      { cid, videoSize, chunkSize, totalChunkCount, expectedChunkCount },
      "init-file: chunk_math_mismatch"
    );
    return res.status(400).json({
      error: "chunk_math_mismatch",
      message: `total_chunk_count (${totalChunkCount}) doesn't match expected value (${expectedChunkCount}). Expected: Math.ceil(${videoSize} / ${chunkSize}) = ${expectedChunkCount}`,
      received: { video_size: videoSize, chunk_size: chunkSize, total_chunk_count: totalChunkCount },
      expected: { total_chunk_count: expectedChunkCount }
    });
  }

  try {
    console.info(
      { cid, videoSize, chunkSize, totalChunkCount, title },
      "init-file: start (validated)"
    );

    const r = await fetch("https://open.tiktokapis.com/v2/post/publish/inbox/video/init/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        source_info: {
          source: "FILE_UPLOAD",
          video_size: videoSize,
          chunk_size: chunkSize,
          total_chunk_count: totalChunkCount,
        },
        post_mode: { mode: "DRAFT" },
        title: title?.toString().slice(0, 150) || undefined,
      }),
    });

    const raw = await r.text();

    if (!r.ok) {
      try {
        const err = JSON.parse(raw);
        const code = err?.error?.code;
        console.warn({ cid, status: r.status, code, err }, "init-file: tiktok error");

        if (code === "spam_risk_too_many_pending_share") {
          return res.status(429).json({
            error: "too_many_pending",
            message: "TikTok limite le nombre d'uploads en attente. Attendez que l'envoi actuel se termine puis réessayez.",
            tiktok: err,
          });
        }
      } catch {
        // ignore JSON parse error
      }
      return res.status(r.status).json({ error: "init_failed", raw: raw.slice(0, 600) });
    }

    const data = JSON.parse(raw);
    const payload = data.data ?? data;

    // Stocker publish_id en session pour bloquer les doublons
    session.last_publish_id = payload.publish_id;
    await session.save();

    console.info(
      {
        cid,
        publish_id: payload.publish_id,
        upload_url: payload.upload_url ? "present" : "missing"
      },
      "init-file: success"
    );

    return res.status(200).json({
      ok: true,
      publish_id: payload.publish_id,
      upload_url: payload.upload_url,
      already_in_progress: false,
    });
  } catch (e: any) {
    console.error({ cid, error: e?.message }, "init-file: crash");
    return res.status(500).json({ error: "init_crash", message: e?.message });
  }
}
