import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "../../../lib/session";

const TIKTOK_TOKEN_URL = "https://www.tiktok.com/v2/oauth/token/";
const getRedirectURI = () =>
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/tiktok`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code, state, error } = req.query as Record<string, string>;
  const session = await getSession(req, res);

  if (error) return res.redirect("/?error=" + error);
  if (!code || !state || session.get("oauth")?.state !== state) {
    return res.redirect("/?error=invalid_state_or_code");
  }

  const body = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY!,
    client_secret: process.env.TIKTOK_CLIENT_SECRET!,
    code,
    grant_type: "authorization_code",
    redirect_uri: getRedirectURI(),
  });

  const r = await fetch(TIKTOK_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!r.ok) return res.redirect("/?error=token_exchange_failed");
  const data = await r.json();

  // Démo: on garde en session (en prod, chiffre en DB)
  session.set("user", {
    open_id: data.open_id,
    access_token: data.access_token,
    expires_in: Date.now() + (data.expires_in ?? 0) * 1000,
    scope: data.scope,
  });
  session.set("oauth", undefined);
  await session.save();

  res.redirect("/connected");
}
