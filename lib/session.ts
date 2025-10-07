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
      access_token?: string;
      open_id?: string;
      openId?: string; // si historique différent
      scopes?: string[];
      scope?: string;  // fallback string
      expires_at?: number;
    };
  last_publish_id?: string;
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
