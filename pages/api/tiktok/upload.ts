import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { getSession } from "../../../lib/session";

export const config = {
    api: {
        bodyParser: false, // ✅ obligatoire pour multipart
    },
};

const UPLOAD_DIR = "/tmp/clip2tok_uploads";

function ensureDir() {
    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

function parseForm(req: NextApiRequest) {
    const form = formidable({
        multiples: false,
        maxFileSize: 300 * 1024 * 1024, // 300MB
    });

    return new Promise<{ file: formidable.File; fields: any }>((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) return reject(err);
            const file = (files.file as formidable.File) || null;
            if (!file) return reject(new Error("No file"));
            resolve({ file, fields });
        });
    });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // ✅ Auth obligatoire
    const session = await getSession(req, res);
    const openId = session.user?.open_id ?? session.user?.openId ?? null;
    if (!openId) return res.status(401).json({ error: "not_authenticated" });

    if (req.method !== "POST") return res.status(405).end();

    try {
        ensureDir();

        const { file } = await parseForm(req);

        const mime = file.mimetype || "";
        if (!mime.startsWith("video/")) {
            return res.status(400).json({ error: "invalid_file_type" });
        }

        const id = crypto.randomBytes(16).toString("hex");
        const ext = path.extname(file.originalFilename || "") || ".mp4";
        const target = path.join(UPLOAD_DIR, `${id}${ext}`);

        // formidable écrit souvent en temp file -> on déplace
        await fs.promises.copyFile(file.filepath, target);
        await fs.promises.unlink(file.filepath).catch(() => { });

        // ⚠️ URL publique : TikTok doit pouvoir y accéder
        // Ça marche sur ton VPS/domaine. Pas sur localhost.
        const baseUrl =
            process.env.NEXT_PUBLIC_BASE_URL || `https://${req.headers.host}`;

        const public_url = `${baseUrl}/api/files/${id}${ext}`;

        return res.status(200).json({ ok: true, public_url });
    } catch (e: any) {
        return res.status(500).json({ error: "upload_failed", message: e?.message });
    }
}
