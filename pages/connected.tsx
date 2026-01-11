// pages/connected.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import type { GetServerSideProps } from "next";
import { getSession } from "../lib/session";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getSession(req, res);

  const user = session.user;
  const openId = user?.open_id ?? user?.openId ?? null;

  // ✅ Optionnel mais recommandé: si tu as expires_at, on vérifie
  const expiresAt = user?.expires_at;
  const isExpired =
    typeof expiresAt === "number" && expiresAt > 0
      ? // si expires_at est en secondes, convertis. Ici j’assume ms:
      Date.now() >= expiresAt
      : false;

  if (!openId || isExpired) {
    // (optionnel) on détruit la session si expirée
    if (isExpired) await session.destroy();

    return {
      redirect: { destination: "/api/auth/tiktok", permanent: false },
    };
  }

  return { props: {} };
};

type Status = "PENDING" | "PROCESSING" | "SUCCEEDED" | "FAILED" | "UNKNOWN";
type InitResp =
  | { ok: true; publish_id: string; request_id?: string | null; already_in_progress?: boolean }
  | { ok?: false; error: string; message?: string };
type StatusResp =
  | { ok: true; status: Status; data: any }
  | { ok?: false; error: string; raw?: string };

type HistoryItem = { date: string; title?: string; source: string; publish_id: string; };
const LOCAL_KEY = "tiktok_upload_history_v1";

export default function Connected() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [title, setTitle] = useState("");
  const [publishId, setPublishId] = useState<string | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [initLoading, setInitLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  useEffect(() => {
    try { const raw = localStorage.getItem(LOCAL_KEY); if (raw) setHistory(JSON.parse(raw)); } catch { }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await res.json();
        setIsAuthenticated(Boolean(data?.open_id));
      } catch {
        setIsAuthenticated(false);
      }
    })();
  }, []);
  const pushHistory = (item: HistoryItem) => {
    const next = [item, ...history].slice(0, 50);
    setHistory(next);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
  };

  const canSend = useMemo(() => {
    if (!videoUrl) return false;
    if (initLoading) return false;
    if (status === "PENDING" || status === "PROCESSING") return false;
    return true;
  }, [videoUrl, initLoading, status]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startPolling = (pid: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPolling(true);
    timerRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/tiktok/status?publish_id=${encodeURIComponent(pid)}`, { method: "GET", headers: { "cache-control": "no-store" } });
        const data: StatusResp = await res.json();
        if (!("ok" in data) || data.ok !== true) {
          setErrorMsg("Le serveur TikTok n’a pas encore renvoyé de mise à jour. C’est normal en mode sandbox, réessayez dans quelques instants.");
          return;
        }
        const s = (data.status ?? "UNKNOWN").toString().toUpperCase();

        // TikTok renvoie souvent SEND_TO_USER_INBOX quand c'est OK (brouillon/inbox)
        const mapped: Status =
          s === "SEND_TO_USER_INBOX" ? "SUCCEEDED" :
            s === "PENDING" ? "PENDING" :
              s === "PROCESSING" ? "PROCESSING" :
                s.includes("FAIL") || s.includes("ERROR") ? "FAILED" :
                  "UNKNOWN";

        setStatus(mapped);

        if (mapped === "SUCCEEDED") {
          setErrorMsg("✅ Vidéo envoyée en brouillon ! Retrouvez-la dans votre Inbox TikTok.");
        }

        if (mapped === "SUCCEEDED" || mapped === "FAILED") {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          setPolling(false);
        }

      } catch { }
    }, 2000);
  };

  const onPickFile = (file: File) => {
    // validations simples
    if (!file.type.startsWith("video/")) {
      setErrorMsg("Merci de sélectionner un fichier vidéo.");
      return;
    }
    if (file.size > 250 * 1024 * 1024) { // 250MB exemple
      setErrorMsg("Fichier trop volumineux (max 250MB pour ce test).");
      return;
    }
    setErrorMsg(null);
    setLocalFile(file);
  };

  const uploadLocalFile = async () => {
    if (!localFile) return;

    setUploading(true);
    setErrorMsg(null);

    try {
      const fd = new FormData();
      fd.append("file", localFile);
      fd.append("filename", localFile.name);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (!res.ok || !data?.public_url) {
        setErrorMsg(data?.error || "Upload échoué.");
        return;
      }

      // ✅ on récupère une URL accessible par TikTok
      setVideoUrl(data.public_url);
      setErrorMsg("✅ Vidéo uploadée. Tu peux maintenant cliquer sur Envoyer.");
    } catch (e) {
      setErrorMsg("Erreur réseau pendant l'upload.");
    } finally {
      setUploading(false);
    }
  };


  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const onInit = async () => {
    setErrorMsg(null);
    setInitLoading(true);
    try {
      const res = await fetch("/api/tiktok/init-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_url: videoUrl, title }),
      });
      if (res.status === 429) {
        const data = await res.json().catch(() => ({}));
        if ((data as any)?.error === "too_many_pending") {
          setErrorMsg("Vous avez déjà 5 partages en attente. Supprimez/publiez des brouillons dans TikTok, ou attendez.");
          return;
        }
      }
      const data: InitResp = await res.json();
      if (!("ok" in data) || data.ok !== true) { setErrorMsg("Échec de l'initialisation. Réessayez."); return; }

      setPublishId(data.publish_id);
      setStatus("PENDING");
      pushHistory({ date: new Date().toISOString(), title, source: videoUrl, publish_id: data.publish_id });
      startPolling(data.publish_id);
    } catch { setErrorMsg("Erreur réseau pendant l'initialisation. Réessayez."); }
    finally { setInitLoading(false); }
  };

  const copyPublishId = async () => { if (publishId) try { await navigator.clipboard.writeText(publishId); } catch { } };

  if (isAuthenticated === null) {
    return (
      <div style={{ textAlign: "center", padding: "48px 16px" }}>
        <span className="spinner" style={{ width: 32, height: 32 }} />
        <p className="muted" style={{ marginTop: 16 }}>Vérification de l'authentification...</p>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return (
      <div style={{ textAlign: "center", padding: "48px 16px", maxWidth: 480, margin: "0 auto" }}>
        <h1 className="h1">Accès refusé</h1>
        <p className="muted" style={{ marginTop: 16 }}>
          Vous devez être connecté avec TikTok pour accéder à cette page.
        </p>
        <a href="/api/auth/tiktok" className="btn primary" style={{ marginTop: 24 }}>
          Se connecter avec TikTok
        </a>
      </div>
    );
  }

  return (
    <>
      <h1 className="h1">Connecté ✓</h1>
      <p className="muted">Testez un upload en brouillon : fichier local ou URL publique.</p>

      <div className="two-col mt16">
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Upload depuis URL</h2>
            <div className="muted">Statut: <span className={`badge ${status === "SUCCEEDED" ? "success" : status === "PENDING" || status === "PROCESSING" ? "warn" : ""}`}>{status ?? "—"} {polling ? "⏳" : ""}</span></div>
          </div>

          <input className="input" placeholder="https://…/video.mp4" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
          <div className="mt12" />
          <input className="input" placeholder="Titre (optionnel)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <div className="mt12" />
          <button className="btn primary" onClick={onInit} disabled={!canSend} title={!canSend ? "Envoi verrouillé pendant le traitement en cours" : "Envoyer"}>
            {initLoading ? <><span className="spinner" />Initialisation…</> : "Envoyer"}
          </button>

          <div className="mt16 kv">
            <div className="muted">publish_id</div>
            <div className="mono">
              {publishId ?? "—"}{" "}
              {publishId && <button className="btn" style={{ marginLeft: 8 }} onClick={copyPublishId}>Copier</button>}
            </div>
            <div className="muted">&nbsp;</div>
            <div />
          </div>

          {errorMsg && <div className="alert info mt16">{errorMsg}</div>}
        </section>

        {/* <section className="card">
          <div className="card-header">
            <h2 className="card-title">Upload depuis votre PC</h2>
            <div className="muted">1) Glissez une vidéo 2) Upload 3) Envoyer</div>
          </div>

          <div
            className="dropzone"
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const f = e.dataTransfer.files?.[0];
              if (f) onPickFile(f);
            }}
            style={{
              border: "2px dashed #444",
              borderRadius: 12,
              padding: 20,
              textAlign: "center",
              cursor: "pointer"
            }}
            onClick={() => document.getElementById("video-file-input")?.click()}
          >
            <input
              id="video-file-input"
              type="file"
              accept="video/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onPickFile(f);
              }}
            />

            {!localFile ? (
              <div>
                <div style={{ fontWeight: 600 }}>Glissez-déposez votre vidéo ici</div>
                <div className="muted" style={{ marginTop: 8 }}>…ou cliquez pour choisir un fichier</div>
              </div>
            ) : (
              <div>
                <div style={{ fontWeight: 600 }}>{localFile.name}</div>
                <div className="muted" style={{ marginTop: 6 }}>
                  {(localFile.size / (1024 * 1024)).toFixed(1)} MB
                </div>
              </div>
            )}
          </div>

          <div className="mt12" />
          <button
            className="btn"
            onClick={uploadLocalFile}
            disabled={!localFile || uploading}
            title={!localFile ? "Choisissez une vidéo" : "Uploader la vidéo"}
          >
            {uploading ? "Upload…" : "Uploader la vidéo"}
          </button>

          <div className="muted mt12">
            Après upload, l’URL sera remplie automatiquement dans le champ “Upload depuis URL”.
          </div>
        </section> */}


        <section className="card">
          <h3 className="h2">Historique (local)</h3>
          <div style={{ overflowX: "auto", marginTop: 8 }}>
            <table className="table">
              <thead>
                <tr><th>Date</th><th>Titre</th><th>Source</th><th>publish_id</th></tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr><td colSpan={4} className="muted">Aucun enregistrement.</td></tr>
                ) : history.map((h, i) => (
                  <tr key={i}>
                    <td>{new Date(h.date).toLocaleString()}</td>
                    <td>{h.title || "—"}</td>
                    <td><span title={h.source} style={{ display: "inline-block", maxWidth: 360, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h.source}</span></td>
                    <td className="mono">{h.publish_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}

// Apply full-page pattern to this page's main container
export const useFullPattern = true;
