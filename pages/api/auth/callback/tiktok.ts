import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "../../../../lib/session";

const TIKTOK_TOKEN_URL = "https://www.tiktok.com/v2/oauth/token/";
const getRedirectURI = () =>
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/tiktok`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { code, state, error } = req.query as Record<string, string>;
    const session = await getSession(req, res);

    if (error) return res.redirect("/?error=" + error);
    if (!code || !state || session.oauth?.state !== state) {
      return res.redirect("/?error=invalid_state_or_code");
    }

    const body = new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY ?? "",
      client_secret: process.env.TIKTOK_CLIENT_SECRET ?? "",
      code,
      grant_type: "authorization_code",
      redirect_uri: getRedirectURI(),
    });

    const r = await fetch(TIKTOK_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    // ← si TikTok renvoie autre chose que 2xx, log le texte brut
    if (!r.ok) {
      const text = await r.text();
      console.error("TT token exchange failed", r.status, text);
      return res.redirect("/?error=token_exchange_failed");
    }

    let data: any;
    try {
      data = await r.json();
    } catch (e) {
      const text = await r.text();
      console.error("TT token not JSON:", text);
      return res.redirect("/?error=token_parse_failed");
    }

    // Certains comptes renvoient sous data.data.{...}
    const payload = data.data ?? data;

    session.user = {
      open_id: payload.open_id,
      access_token: payload.access_token,
      expires_in: Date.now() + (payload.expires_in ?? 0) * 1000,
      scope: payload.scope,
    };
    delete session.oauth;
    await session.save();

    return res.redirect("/connected");
  } catch (e: any) {
    console.error("Callback crash:", e?.message || e);
    return res.status(500).json({ error: "callback_crash" });
  }
}
