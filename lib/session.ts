// web/lib/session.ts
import { IronSessionOptions } from "iron-session";
import { getIronSession } from "iron-session";
import type { NextApiRequest, NextApiResponse } from "next";

export const sessionOptions: IronSessionOptions = {
  cookieName: "clip2tok_sess",
  password: process.env.SESSION_SECRET!, // 32+ chars
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  },
};

export async function getSession(req: NextApiRequest, res: NextApiResponse) {
  return getIronSession(req, res, sessionOptions);
}
