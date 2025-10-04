import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "../../../lib/session";

const TIKTOK_AUTH_URL = "https://www.tiktok.com/v2/auth/authorize/";
const getRedirectURI = () =>
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/tiktok`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req, res);
  const state = crypto.randomUUID();
  session.set("oauth", { state, startedAt: Date.now() });
  await session.save();

  const params = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY!,
    response_type: "code",
    scope: "video.upload",
    redirect_uri: getRedirectURI(),
    state,
  });

  res.redirect(`${TIKTOK_AUTH_URL}?${params.toString()}`);
}
