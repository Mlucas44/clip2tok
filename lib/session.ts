// web/lib/session.ts
import {
  getIronSession,
  type SessionOptions,
  type IronSession,
} from "iron-session";
import type { NextApiRequest, NextApiResponse } from "next";

// 👇 Ton modèle de session
export interface SessionData {
  oauth?: { state: string; startedAt: number };
  user?: {
    open_id: string;
    access_token: string;
    expires_in: number; // timestamp ms (Date.now() + ...)
    scope?: string;
    last_publish_id?: string;
  };
}

export const sessionOptions: SessionOptions = {
  cookieName: "clip2tok_sess",
  password: process.env.SESSION_SECRET!, // 32+ chars
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  },
};

// 👇 On renvoie une IronSession typée
export async function getSession(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<IronSession<SessionData>> {
  return getIronSession<SessionData>(req, res, sessionOptions);
}
