// extrait simplifié côté client
import { useState } from "react";

export default function Connected() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<string>("");

  const handleInit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Initialisation…");
    const r = await fetch("/api/tiktok/init-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ video_url: url, title: "Importer via Clip2Tok" }),
    });
    const data = await r.json();
    if (!r.ok) { setStatus(`Erreur: ${data.error}`); return; }

    const publish_id = data.publish_id;  // 👈 plus "upload_id"
    setStatus(`Brouillon créé (publish_id: ${publish_id}) — on vérifie le statut…`);

    // petit polling simple
    const poll = async () => {
      const rs = await fetch("/api/tiktok/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publish_id }),
      });
      const ds = await rs.json();
      if (!rs.ok) { setStatus(`Erreur statut: ${ds.error}`); return; }

      const payload = ds.data?.data ?? ds.data;
      const s = payload?.status ?? payload?.task_status ?? "UNKNOWN";
      const reqId = payload?.request_id ?? ds.data?.request_id ?? "?";
      setStatus(`Statut: ${s} — request_id: ${reqId}`);

      if (["PENDING","PROCESSING","IN_PROGRESS"].includes(String(s).toUpperCase())) {
        setTimeout(poll, 1500);
      } else {
        setStatus(prev => prev + " ✅");
      }
    };
    poll();
  };

  return (
    <main style={{padding:24, maxWidth:760, margin:"0 auto"}}>
      <h1>Connecté ✓</h1>
      <p>Testez un upload en brouillon : fichier local ou URL publique.</p>

      <h2>Upload depuis URL</h2>
      <form onSubmit={handleInit}>
        <input
          type="url"
          required
          placeholder="https://…/video.mp4"
          value={url}
          onChange={e => setUrl(e.target.value)}
          style={{width:"100%", padding:8}}
        />
        <button type="submit" style={{marginTop:8}}>Envoyer</button>
      </form>

      <div style={{marginTop:16, fontFamily:"monospace"}}>{status}</div>
    </main>
  );
}
