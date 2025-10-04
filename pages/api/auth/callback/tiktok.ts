import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "../../../../lib/session";

const TIKTOK_TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";

// const TIKTOK_TOKEN_URL = "https://www.tiktok.com/v2/oauth/token/";
const getRedirectURI = () =>
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/tiktok`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 0) Sanity checks ENV
    if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
      return res.status(500).json({ error: "SESSION_SECRET_invalid" });
    }
    if (!process.env.TIKTOK_CLIENT_KEY) {
      return res.status(500).json({ error: "TIKTOK_CLIENT_KEY_missing" });
    }
    if (!process.env.TIKTOK_CLIENT_SECRET) {
      return res.status(500).json({ error: "TIKTOK_CLIENT_SECRET_missing" });
    }
    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      return res.status(500).json({ error: "NEXT_PUBLIC_BASE_URL_missing" });
    }

    const { code, state, error } = req.query as Record<string, string>;
    const session = await getSession(req, res);

    if (error) return res.status(400).json({ error: "oauth_error_param", detail: error });

    if (!code || !state) {
      return res.status(400).json({ error: "missing_code_or_state", code, state });
    }

    // 1) Vérifie que le state en session existe (cookie OK ?)
    if (!session.oauth?.state) {
      return res.status(400).json({ error: "missing_session_oauth_state" });
    }
    if (session.oauth.state !== state) {
      return res.status(400).json({ error: "state_mismatch", expected: session.oauth.state, got: state });
    }

    // 2) Échange code → token
    const redirectUri = getRedirectURI();
    const body = new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY!,
      client_secret: process.env.TIKTOK_CLIENT_SECRET!,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    });

    const r = await fetch(TIKTOK_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    // ✅ Lire UNE fois le corps brut
    const raw = await r.text();

    if (!r.ok) {
      return res.status(502).json({
        error: "token_exchange_failed",
        status: r.status,
        redirect_uri: redirectUri,
        raw: raw.slice(0, 512),
      });
    }

    let data: any;
    try {
      data = JSON.parse(raw);              // parse JSON à partir du texte
    } catch {
      return res.status(502).json({
        error: "token_parse_failed",
        raw: raw.slice(0, 512),
      });
    }

    const payload = data.data ?? data;
    if (!payload?.access_token || !payload?.open_id) {
      return res.status(502).json({ error: "token_payload_incomplete", payload });
    }

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
    return res.status(500).json({ error: "callback_crash", message: e?.message });
  }
}
