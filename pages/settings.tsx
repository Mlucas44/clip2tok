// pages/settings.tsx
import { useEffect, useState } from "react";

type Me = { open_id: string | null; scopes: string[]; last_publish_id: string | null };

export default function SettingsPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/auth/me");
      const d = (await r.json()) as Me;
      setMe(d);
    })();
  }, []);

  const logout = () => {
    window.location.href = "/api/auth/logout";
  };

  const wipe = async () => {
    setBusy(true);
    setToast(null);
    try {
      const r = await fetch("/api/auth/delete", { method: "POST" });
      if (r.ok) setToast("✅ Données supprimées.");
      else setToast("❌ Échec de la suppression.");
    } catch {
      setToast("❌ Erreur réseau.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>Paramètres</h1>

      <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, lineHeight: 1.7 }}>
        <div><b>open_id :</b> <span style={{ fontFamily: "monospace" }}>{me?.open_id ?? "—"}</span></div>
        <div><b>scopes :</b> {me?.scopes?.length ? me.scopes.join(", ") : "—"}</div>
        <div><b>upload en cours :</b> <span style={{ fontFamily: "monospace" }}>{me?.last_publish_id ?? "—"}</span></div>

        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <button
            onClick={logout}
            style={{ padding: "8px 14px", borderRadius: 6, border: "1px solid #aaa", background: "#111", color: "#fff" }}
          >
            Déconnexion
          </button>
          <button
            onClick={wipe}
            disabled={busy}
            style={{ padding: "8px 14px", borderRadius: 6, border: "1px solid #c33", background: busy ? "#ddd" : "#c62828", color: "#fff" }}
            title="Supprimer mes données côté serveur"
          >
            Supprimer mes données
          </button>
        </div>

        {toast && <p style={{ marginTop: 8 }}>{toast}</p>}
      </div>

      <p style={{ marginTop: 16, fontSize: 14, color: "#555" }}>
        Vous pouvez aussi demander la suppression via <a href="/deletion">/deletion</a>.
      </p>
    </main>
  );
}
