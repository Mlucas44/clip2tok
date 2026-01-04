// middleware.ts
import { NextRequest, NextResponse } from "next/server";

const isDev = process.env.NODE_ENV !== "production";

// --- CSP: profil PROD vs DEV (dev autorise eval + ws pour HMR)
const CSP_PROD = [
  "default-src 'self'",
  "img-src 'self' data: https:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self'",
  "connect-src 'self' https://open.tiktokapis.com https://open-upload-i18n.tiktokapis.com https://*.tiktokapis.com",
  "font-src 'self' https:",
  "frame-ancestors 'none'",
].join("; ");

const CSP_DEV = [
  "default-src 'self'",
  "img-src 'self' data: blob: https:",        // blob: utile parfois en dev
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-eval' blob:",    // <-- autorise eval pour react-refresh
  "connect-src 'self' https://open.tiktokapis.com https://open-upload-i18n.tiktokapis.com https://*.tiktokapis.com ws: wss:", // <-- HMR via WebSocket + TikTok upload
  "font-src 'self' https:",
  "frame-ancestors 'none'",
].join("; ");

const WINDOW_MS = 60_000;
const LIMIT = 60;

// @ts-ignore
globalThis.__rate_hits__ ||= new Map<string, { ts: number; count: number }>();
const hits = globalThis.__rate_hits__ as Map<string, { ts: number; count: number }>;

export function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const res = NextResponse.next();

  // Correlation ID
  const incomingCid = req.headers.get("x-correlation-id");
  const cid = incomingCid || crypto.randomUUID();
  res.headers.set("x-correlation-id", cid);

  // CSP + headers sécurité
  res.headers.set("Content-Security-Policy", isDev ? CSP_DEV : CSP_PROD);
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  // HSTS (si HTTPS)
  if (req.headers.get("x-forwarded-proto") === "https") {
    res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }

  // Rate-limit sur /api/tiktok/*
  if (url.pathname.startsWith("/api/tiktok/")) {
    const ip = (req.headers.get("x-real-ip") || req.ip || req.headers.get("x-forwarded-for") || "unknown")
      .toString()
      .split(",")[0]
      .trim();

    const now = Date.now();
    const bucket = hits.get(ip) ?? { ts: now, count: 0 };

    if (now - bucket.ts > WINDOW_MS) {
      bucket.ts = now;
      bucket.count = 0;
    }

    bucket.count += 1;
    hits.set(ip, bucket);

    res.headers.set("x-ratelimit-limit", String(LIMIT));
    res.headers.set("x-ratelimit-remaining", String(Math.max(0, LIMIT - bucket.count)));

    if (bucket.count > LIMIT) {
      return new NextResponse(
        JSON.stringify({ error: "rate_limited", message: "Trop de requêtes, réessayez dans une minute." }),
        { status: 429, headers: { ...Object.fromEntries(res.headers), "content-type": "application/json; charset=utf-8" } }
      );
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
