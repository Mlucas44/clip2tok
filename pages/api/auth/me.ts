import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "../../../lib/session";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req, res);
  const user = session.get("user");
  res.status(200).json({ isAuthenticated: !!user?.open_id, user: user ?? null });
}
