import type { NextApiRequest, NextApiResponse } from "next";
export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    version: process.env.NEXT_PUBLIC_APP_VERSION || "dev",
    git_sha: process.env.NEXT_PUBLIC_GIT_SHA || "dev",
    uptime_s: Math.round(process.uptime()),
  });
}
