// pages/api/auth/logout.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "../../../lib/session";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req, res);
  try {
    await session.destroy?.(); // iron-session
  } catch {
    // no-op
  }
  // Redirige vers la home
  res.writeHead(302, { Location: "/" });
  res.end();
}
