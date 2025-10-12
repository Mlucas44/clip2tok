import { useState } from "react";

export default function Deletion() {
  const [done, setDone] = useState(false);
  const callDelete = async () => {
    // Si ton endpoint est /api/auth/delete, garde cette ligne :
    const res = await fetch("/api/auth/delete", { method: "POST" });
    // Si tu utilises /api/me/delete, remplace par: "/api/me/delete"
    if (res.ok) setDone(true);
  };

  return (
    <>
      <h1 className="h1">Suppression des données</h1>
      <div className="card">
        <p>
          Vous pouvez demander la suppression immédiate des données stockées côté serveur
          (principalement la session, le <span className="mono">publish_id</span> en cours et les logs corrélés).
        </p>
        <div style={{display:"flex", gap:12, flexWrap:"wrap"}} className="mt12">
          <a className="btn" href="mailto:privacy@tondomaine.com">Envoyer un email</a>
          <button className="btn danger" onClick={callDelete}>Supprimer via l’API</button>
        </div>
        {done && <div className="alert info mt16">OK supprimé.</div>}
      </div>
    </>
  );
}
