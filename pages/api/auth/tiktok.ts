import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "../../../lib/session";

const TIKTOK_AUTH_URL = "https://www.tiktok.com/v2/auth/authorize/";
const getRedirectURI = () =>
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/tiktok`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req, res);
  const state = crypto.randomUUID();

  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
  return res.status(500).json({ error: "Invalid SESSION_SECRET" });
  }
  if (!process.env.TIKTOK_CLIENT_KEY) {
    return res.status(500).json({ error: "Missing TIKTOK_CLIENT_KEY" });
  }
  if (!process.env.NEXT_PUBLIC_BASE_URL) {
    return res.status(500).json({ error: "Missing NEXT_PUBLIC_BASE_URL" });
  }

  // v8: on assigne directement
  session.oauth = { state, startedAt: Date.now() };
  await session.save();

  const params = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY!,
    response_type: "code",
    scope: "user.info.basic", //video.upload
    redirect_uri: getRedirectURI(),
    state,
  });

  res.redirect(`${TIKTOK_AUTH_URL}?${params.toString()}`);
}
