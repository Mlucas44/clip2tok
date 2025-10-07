// pages/connected.tsx
import { useEffect, useMemo, useRef, useState } from "react";

type Status = "PENDING" | "PROCESSING" | "SUCCEEDED" | "FAILED" | "UNKNOWN";
type InitResp =
  | { ok: true; publish_id: string; request_id?: string | null; already_in_progress?: boolean }
  | { ok?: false; error: string; message?: string };
type StatusResp =
  | { ok: true; status: Status; data: any }
  | { ok?: false; error: string; raw?: string };

type HistoryItem = {
  date: string;          // ISO
  title?: string;
  source: string;        // url
  publish_id: string;
};

const LOCAL_KEY = "tiktok_upload_history_v1";

export default function Connected() {
  const [videoUrl, setVideoUrl] = useState("");
  const [title, setTitle] = useState("");
  const [publishId, setPublishId] = useState<string | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [initLoading, setInitLoading] = useState(false);
  const [polling, setPolling] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
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
        const res = await fetch(`/api/tiktok/status?publish_id=${encodeURIComponent(pid)}`, {
          method: "GET",
          headers: { "cache-control": "no-store" },
        });
        const data: StatusResp = await res.json();
        if (!("ok" in data) || data.ok !== true) {
          // erreur côté API status
          setErrorMsg("Le serveur TikTok n’a pas encore renvoyé de mise à jour. C’est normal en mode sandbox, réessayez dans quelques instants.");
          return;
        }
        const rawStatus = (data.status ?? "UNKNOWN") as Status;
        setStatus(rawStatus);
        
        if (rawStatus === "SUCCEEDED") {
          setErrorMsg("✅ Vidéo envoyée en brouillon ! Retrouvez-la dans votre Inbox TikTok.");
        }

        // Terminé ? on stoppe le polling (ton /status libère le verrou côté session)
        if (rawStatus === "SUCCEEDED" || rawStatus === "FAILED") {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          setPolling(false);
        }
      } catch {
        // soft fail
      }
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const onInit = async () => {
    setErrorMsg(null);
    setInitLoading(true);
    try {
      const res = await fetch("/api/tiktok/init-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_url: videoUrl, title }),
      });

      // Gestion 429 avec message "too_many_pending"
      if (res.status === 429) {
        const data = await res.json().catch(() => ({}));
        if ((data as any)?.error === "too_many_pending") {
          setErrorMsg("Vous avez déjà 5 partages en attente. Supprimez/publiez des brouillons dans TikTok, ou attendez.");
          return;
        }
      }

      const data: InitResp = await res.json();
      if (!("ok" in data) || data.ok !== true) {
        setErrorMsg("Échec de l'initialisation. Réessayez.");
        return;
      }

      setPublishId(data.publish_id);
      setStatus("PENDING");

      // Historique local
      pushHistory({
        date: new Date().toISOString(),
        title,
        source: videoUrl,
        publish_id: data.publish_id,
      });

      // Démarre le polling (y compris si already_in_progress)
      startPolling(data.publish_id);
    } catch {
      setErrorMsg("Erreur réseau pendant l'initialisation. Réessayez.");
    } finally {
      setInitLoading(false);
    }
  };

  const copyPublishId = async () => {
    if (!publishId) return;
    try {
      await navigator.clipboard.writeText(publishId);
    } catch {}
  };

  return (
    <main style={{ maxWidth: 880, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 40, fontWeight: 700, marginBottom: 8 }}>Connecté ✓</h1>
      <p>Testez un upload en brouillon : fichier local ou URL publique.</p>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Upload depuis URL</h2>

        <input
          placeholder="https://…/video.mp4"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          style={{ width: "100%", padding: 12, border: "1px solid #999", borderRadius: 6, marginBottom: 8 }}
        />
        <input
          placeholder="Titre (optionnel)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%", padding: 12, border: "1px solid #999", borderRadius: 6, marginBottom: 12 }}
        />

        <button
          onClick={onInit}
          disabled={!canSend}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            border: "1px solid #888",
            background: canSend ? "#111" : "#ccc",
            color: "#fff",
            cursor: canSend ? "pointer" : "not-allowed",
          }}
          title={!canSend ? "Envoi verrouillé pendant le traitement en cours" : "Envoyer"}
        >
          {initLoading ? "Initialisation…" : "Envoyer"}
        </button>

        <div style={{ marginTop: 16, fontSize: 14, lineHeight: 1.6 }}>
          <div>
            <span style={{ fontFamily: "monospace" }}>publish_id</span> :{" "}
            {publishId ? <b>{publishId}</b> : <em>—</em>}{" "}
            <button
              onClick={copyPublishId}
              disabled={!publishId}
              style={{ marginLeft: 8, textDecoration: "underline", color: publishId ? "#4b5bdc" : "#999" }}
            >
              Copier
            </button>
          </div>
          <div>
            <span style={{ fontFamily: "monospace" }}>status</span> :{" "}
            {status ?? <em>—</em>} {polling ? "⏳" : ""}
          </div>
          {errorMsg && <p style={{ color: "#b00020" }}>{errorMsg}</p>}
        </div>
      </section>

      <section style={{ marginTop: 28 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700 }}>Historique (local)</h3>
        <div style={{ overflowX: "auto", marginTop: 8 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#f3f3f3" }}>
                <th style={{ textAlign: "left", padding: 8, border: "1px solid #ddd" }}>Date</th>
                <th style={{ textAlign: "left", padding: 8, border: "1px solid #ddd" }}>Titre</th>
                <th style={{ textAlign: "left", padding: 8, border: "1px solid #ddd" }}>Source</th>
                <th style={{ textAlign: "left", padding: 8, border: "1px solid #ddd" }}>publish_id</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: 12, textAlign: "center", color: "#777" }}>
                    Aucun enregistrement.
                  </td>
                </tr>
              ) : (
                history.map((h, i) => (
                  <tr key={i}>
                    <td style={{ padding: 8, border: "1px solid #eee" }}>
                      {new Date(h.date).toLocaleString()}
                    </td>
                    <td style={{ padding: 8, border: "1px solid #eee" }}>{h.title || "—"}</td>
                    <td style={{ padding: 8, border: "1px solid #eee" }}>
                      <span title={h.source} style={{ display: "inline-block", maxWidth: 260, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {h.source}
                      </span>
                    </td>
                    <td style={{ padding: 8, border: "1px solid #eee", fontFamily: "monospace" }}>{h.publish_id}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
