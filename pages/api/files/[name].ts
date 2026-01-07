import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = "/tmp/clip2tok_uploads";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const name = req.query.name as string;
    if (!name) return res.status(400).end();

    const filePath = path.join(UPLOAD_DIR, name);

    if (!fs.existsSync(filePath)) return res.status(404).end();

    // ⚠️ Si tu veux être strict: ajoute un token/expirations.
    // Pour un MVP test: on sert le fichier tel quel.
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Type", "video/mp4");

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
}
