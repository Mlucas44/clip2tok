// pages/api/tiktok/reset-upload.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "../../../lib/session";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const cid = (req.headers["x-correlation-id"] as string) || "no-cid";
  const session = await getSession(req, res);
  const token = session.user?.access_token;

  if (!token) {
    console.warn({ cid }, "reset-upload: not_authenticated");
    return res.status(401).json({ error: "not_authenticated" });
  }

  const hadPublishId = !!session.last_publish_id;
  const hadUploadUrl = !!session.last_upload_url;

  // Nettoyer les verrous d'upload en session
  delete (session as any).last_publish_id;
  delete (session as any).last_upload_url;
  await session.save();

  console.info(
    { cid, hadPublishId, hadUploadUrl },
    "reset-upload: session cleared"
  );

  return res.status(200).json({
    ok: true,
    message: "Upload session reset. You can now start a new upload.",
    cleared: { publish_id: hadPublishId, upload_url: hadUploadUrl },
  });
}
