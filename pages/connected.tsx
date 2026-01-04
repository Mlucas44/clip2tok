// pages/connected.tsx
import { useEffect, useMemo, useRef, useState } from "react";

type Status = "PENDING" | "PROCESSING" | "SUCCEEDED" | "FAILED" | "UNKNOWN";
type InitResp =
  | { ok: true; publish_id: string; request_id?: string | null; already_in_progress?: boolean }
  | { ok?: false; error: string; message?: string };
type InitFileResp =
  | { ok: true; publish_id: string; upload_url?: string; already_in_progress?: boolean; can_resume?: boolean; message?: string }
  | { ok?: false; error: string; message?: string };
type StatusResp =
  | { ok: true; status: Status; data: any }
  | { ok?: false; error: string; raw?: string };

type HistoryItem = { date: string; title?: string; source: string; publish_id: string; };
const LOCAL_KEY = "tiktok_upload_history_v1";

export default function Connected() {
  const [videoUrl, setVideoUrl] = useState("");
  const [title, setTitle] = useState("");
  const [publishId, setPublishId] = useState<string | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [initLoading, setInitLoading] = useState(false);
  const [polling, setPolling] = useState(false);

  // États pour l'upload de fichier
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  useEffect(() => {
    try { const raw = localStorage.getItem(LOCAL_KEY); if (raw) setHistory(JSON.parse(raw)); } catch {}
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
        const rawStatus = (data.status ?? "UNKNOWN") as Status;
        setStatus(rawStatus);
        if (rawStatus === "SUCCEEDED") setErrorMsg("✅ Vidéo envoyée en brouillon ! Retrouvez-la dans votre Inbox TikTok.");
        if (rawStatus === "SUCCEEDED" || rawStatus === "FAILED") {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          setPolling(false);
        }
      } catch {}
    }, 2000);
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

  const copyPublishId = async () => { if (publishId) try { await navigator.clipboard.writeText(publishId); } catch {} };

  // Gestion du drag & drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Vérifier que c'est bien une vidéo
      if (file.type.startsWith('video/')) {
        setSelectedFile(file);
        setErrorMsg(null);
      } else {
        setErrorMsg("Veuillez sélectionner un fichier vidéo (MP4, MOV, WebM, etc.)");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('video/')) {
        setSelectedFile(file);
        setErrorMsg(null);
      } else {
        setErrorMsg("Veuillez sélectionner un fichier vidéo (MP4, MOV, WebM, etc.)");
      }
    }
  };

  const onFileUpload = async () => {
    if (!selectedFile) return;

    setErrorMsg(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      // Upload chunké (requis par TikTok)
      // TikTok exige Content-Range headers, donc on découpe en vrais chunks
      const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB par chunk (recommandé TikTok)
      const videoSize = selectedFile.size;
      const chunkSize = CHUNK_SIZE;
      const totalChunks = Math.ceil(videoSize / chunkSize);

      // 1) Initialiser l'upload avec TikTok
      const initRes = await fetch("/api/tiktok/init-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video_size: videoSize,
          chunk_size: chunkSize,
          total_chunk_count: totalChunks,
          title,
        }),
      });

      if (initRes.status === 429) {
        const data = await initRes.json().catch(() => ({}));
        if ((data as any)?.error === "too_many_pending") {
          setErrorMsg("Vous avez déjà 5 partages en attente. Supprimez/publiez des brouillons dans TikTok, ou attendez.");
          return;
        }
      }

      const initData: InitFileResp = await initRes.json();
      if (!("ok" in initData) || initData.ok !== true) {
        setErrorMsg("Échec de l'initialisation de l'upload. Réessayez.");
        return;
      }

      const { publish_id, upload_url, can_resume, message } = initData;

      // Guard: si pas d'upload_url et can_resume=false, afficher erreur + bouton reset
      if (!upload_url) {
        if (can_resume === false) {
          setErrorMsg(message || "Upload en cours mais URL expirée. Cliquez sur 'Réinitialiser l'upload' ci-dessous.");
          setPublishId(publish_id);
          return;
        }
        setErrorMsg("Erreur: pas d'upload_url reçu de TikTok. Réessayez.");
        return;
      }

      setPublishId(publish_id);

      // 2) Uploader le fichier vers TikTok CHUNK PAR CHUNK avec Content-Range
      let uploadedBytes = 0;

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * chunkSize;
        const end = Math.min(start + chunkSize, videoSize); // end EXCLUSIF pour slice
        const chunk = selectedFile.slice(start, end);

        // Content-Range: bytes start-endInclusive/total
        // ⚠️ end dans le header est INCLUSIF (dernier byte)
        const rangeStart = start;
        const rangeEnd = end - 1; // end - 1 car inclusif
        const contentRange = `bytes ${rangeStart}-${rangeEnd}/${videoSize}`;

        console.log(`Uploading chunk ${chunkIndex + 1}/${totalChunks}: ${contentRange}`);

        // Upload du chunk avec retry simple
        let success = false;
        let retries = 0;
        const MAX_RETRIES = 2;

        while (!success && retries <= MAX_RETRIES) {
          try {
            const response = await fetch(upload_url, {
              method: "PUT",
              headers: {
                "Content-Type": "video/mp4",
                "Content-Range": contentRange,
              },
              body: chunk,
            });

            if (response.ok) {
              success = true;
              uploadedBytes += chunk.size;

              // Mise à jour de la progress bar
              const progress = Math.round((uploadedBytes / videoSize) * 100);
              setUploadProgress(progress);
            } else {
              const errorText = await response.text().catch(() => "");
              console.error(`Chunk ${chunkIndex} failed: ${response.status} ${response.statusText}`, errorText.slice(0, 200));

              if (retries < MAX_RETRIES) {
                retries++;
                console.log(`Retrying chunk ${chunkIndex} (attempt ${retries + 1}/${MAX_RETRIES + 1})...`);
                await new Promise(resolve => setTimeout(resolve, 1000 * retries)); // backoff
              } else {
                throw new Error(`Chunk ${chunkIndex} failed after ${MAX_RETRIES + 1} attempts: ${response.status}`);
              }
            }
          } catch (err: any) {
            if (retries < MAX_RETRIES) {
              retries++;
              console.log(`Network error on chunk ${chunkIndex}, retrying... (${retries}/${MAX_RETRIES})`, err.message);
              await new Promise(resolve => setTimeout(resolve, 1000 * retries));
            } else {
              throw new Error(`Chunk ${chunkIndex} network error after retries: ${err.message}`);
            }
          }
        }
      }

      // 3) Tous les chunks uploadés → démarrer le polling
      setStatus("PENDING");
      pushHistory({
        date: new Date().toISOString(),
        title,
        source: selectedFile.name,
        publish_id,
      });
      startPolling(publish_id);
      setUploadProgress(100);
      setErrorMsg("✅ Upload terminé ! Traitement en cours...");

    } catch (e: any) {
      setErrorMsg(`Erreur pendant l'upload: ${e?.message}`);
    } finally {
      setUploading(false);
    }
  };

  const canUploadFile = useMemo(() => {
    if (!selectedFile) return false;
    if (uploading) return false;
    if (status === "PENDING" || status === "PROCESSING") return false;
    return true;
  }, [selectedFile, uploading, status]);

  const onResetUpload = async () => {
    try {
      const res = await fetch("/api/tiktok/reset-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.ok) {
        setErrorMsg(null);
        setPublishId(null);
        setStatus(null);
        setUploadProgress(0);
        setErrorMsg("✅ Upload réinitialisé. Vous pouvez recommencer.");
      } else {
        setErrorMsg("Erreur lors de la réinitialisation.");
      }
    } catch {
      setErrorMsg("Erreur réseau lors de la réinitialisation.");
    }
  };

  return (
    <>
      <h1 className="h1">Connecté ✓</h1>
      <p className="muted">Testez un upload en brouillon : fichier local ou URL publique.</p>

      <div className="two-col mt16">
        {/* Upload de fichier local */}
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Upload fichier local</h2>
            <div className="muted">Statut: <span className={`badge ${status === "SUCCEEDED" ? "success" : status === "PENDING" || status === "PROCESSING" ? "warn" : ""}`}>{status ?? "—"} {polling ? "⏳" : ""}</span></div>
          </div>

          {/* Dropzone */}
          <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? 'var(--primary)' : 'rgba(0,0,0,0.2)'}`,
              borderRadius: 8,
              padding: 40,
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: isDragging ? 'rgba(0,100,255,0.05)' : 'rgba(0,0,0,0.02)',
              transition: 'all 0.2s ease',
              marginBottom: 16
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <div style={{ fontSize: 48, marginBottom: 12 }}>📹</div>
            {selectedFile ? (
              <>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>{selectedFile.name}</p>
                <p className="muted" style={{ fontSize: 14 }}>
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </>
            ) : (
              <>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>Glissez une vidéo ici</p>
                <p className="muted" style={{ fontSize: 14 }}>ou cliquez pour sélectionner</p>
              </>
            )}
          </div>

          <input className="input" placeholder="Titre (optionnel)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <div className="mt12" />

          {/* Barre de progression */}
          {uploading && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span className="muted" style={{ fontSize: 14 }}>Upload en cours...</span>
                <span className="muted" style={{ fontSize: 14 }}>{uploadProgress}%</span>
              </div>
              <div style={{ width: '100%', height: 8, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  width: `${uploadProgress}%`,
                  height: '100%',
                  backgroundColor: 'var(--primary)',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          )}

          <button className="btn primary" onClick={onFileUpload} disabled={!canUploadFile} title={!canUploadFile ? "Sélectionnez un fichier vidéo" : "Envoyer"}>
            {uploading ? <><span className="spinner"/>Upload en cours...</> : "Envoyer"}
          </button>

          {/* Bouton reset si upload bloqué */}
          {errorMsg && errorMsg.includes("expirée") && (
            <div style={{ marginTop: 12 }}>
              <button className="btn" onClick={onResetUpload} style={{ width: '100%', backgroundColor: '#f59e0b', color: 'white' }}>
                Réinitialiser l'upload
              </button>
            </div>
          )}
        </section>

        {/* Upload depuis URL */}
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
            {initLoading ? <><span className="spinner"/>Initialisation…</> : "Envoyer"}
          </button>

          <div className="mt16 kv">
            <div className="muted">publish_id</div>
            <div className="mono">
              {publishId ?? "—"}{" "}
              {publishId && <button className="btn" style={{marginLeft:8}} onClick={copyPublishId}>Copier</button>}
            </div>
            <div className="muted">&nbsp;</div>
            <div />
          </div>

          {errorMsg && <div className="alert info mt16">{errorMsg}</div>}
        </section>

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
                    <td><span title={h.source} style={{display:"inline-block",maxWidth:360,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{h.source}</span></td>
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
