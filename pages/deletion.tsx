// app/deletion/page.tsx
"use client";
import { useState } from "react";

export default function Deletion() {
  const [done, setDone] = useState(false);
  const callDelete = async () => {
    const res = await fetch("/api/me/delete", { method: "POST" });
    if (res.ok) setDone(true);
  };
  return (
    <main className="mx-auto max-w-2xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Suppression des données</h1>
      <p>Vous pouvez demander la suppression immédiate des données stockées côté serveur (principalement la session et logs corrélés).</p>
      <div className="space-x-3">
        <a className="underline" href="mailto:privacy@tondomaine.com">Envoyer un email</a>
        <button className="px-3 py-2 rounded-md bg-black text-white" onClick={callDelete}>Supprimer via l’API</button>
      </div>
      {done && <p className="text-green-700">OK supprimé.</p>}
    </main>
  );
}
