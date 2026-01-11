// pages/api/tiktok/status.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "../../../lib/session";

const DONE_STATES = ["DONE", "SUCCESS", "FINISHED", "FAILED", "ERROR", "COMPLETED"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cid = (req.headers["x-correlation-id"] as string) || "no-cid";
  const session = await getSession(req, res);
  const token = session.user?.access_token;
  if (!token) {
    console.warn({ cid }, "status: not_authenticated");
    return res.status(401).json({ error: "not_authenticated" });
  }

  const publish_id = (req.query.publish_id as string) || (req.body as any)?.publish_id;
  if (!publish_id) {
    console.warn({ cid }, "status: missing_publish_id");
    return res.status(400).json({ error: "missing_publish_id" });
  }

  console.info({ cid, publish_id }, "status: query");
  // const r = await fetch("https://open.tiktokapis.com/v2/post/publish/inbox/video/query/", {
  const r = await fetch("https://open.tiktokapis.com/v2/post/publish/status/fetch/", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ publish_id }),
  });

  const raw = await r.text();

  // En sandbox, renvoie souvent 4xx/5xx : on mappe en 200 avec un status synthétique.
  if (!r.ok) {
    try {
      const err = JSON.parse(raw);
      const status = (err?.error?.code ?? "UNKNOWN").toString().toUpperCase();
      console.warn({ cid, publish_id, status, err }, "status: tiktok error mapped to 200");
      return res.status(200).json({ ok: true, status, data: err });
    } catch {
      console.error({ cid, publish_id, status: r.status, raw: raw.slice(0, 300) }, "status: non-json error");
      return res.status(r.status).json({ ok: false, error: "status_failed", raw: raw.slice(0, 800) });
    }
  }

  const data = JSON.parse(raw);
  const payload = data?.data ?? data;
  const status =
    (payload?.status ??
      payload?.publish_status ??
      payload?.share_status ??
      payload?.task_status ??
      "UNKNOWN").toString().toUpperCase();


  // const payload = data.data ?? data;
  // const status = (payload?.status ?? payload?.task_status ?? "UNKNOWN").toString().toUpperCase();

  // si terminé: libérer le verrou pour permettre un nouvel init
  if (DONE_STATES.includes(status) && session.last_publish_id === publish_id) {
    delete (session as any).last_publish_id;
    await session.save();
    console.info({ cid, publish_id, status }, "status: done -> lock released");
  } else {
    console.info({ cid, publish_id, status }, "status: polling");
  }

  return res.status(200).json({ ok: true, data, status });
}
