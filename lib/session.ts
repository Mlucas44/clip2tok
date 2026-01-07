// lib/session.ts
import {
  getIronSession,
  type SessionOptions,
  type IronSession,
} from "iron-session";

import type { NextApiRequest, NextApiResponse } from "next";
import type { IncomingMessage, ServerResponse } from "http";

export interface SessionData {
  oauth?: { state: string; startedAt: number };
  user?: {
    access_token?: string;
    open_id?: string;
    openId?: string;
    scopes?: string[];
    scope?: string;
    expires_at?: number;
  };
  last_publish_id?: string;
}

export const sessionOptions: SessionOptions = {
  cookieName: "studioReels_sess",
  password: process.env.SESSION_SECRET!, // 32+ chars
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  },
};


export async function getSession(
  req: NextApiRequest | IncomingMessage,
  res: NextApiResponse | ServerResponse
): Promise<IronSession<SessionData>> {
  return getIronSession<SessionData>(req as any, res as any, sessionOptions);
}
