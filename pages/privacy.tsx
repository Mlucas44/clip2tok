// app/privacy/page.tsx
export default function Privacy() {
  return (
    <main className="mx-auto max-w-2xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Politique de confidentialité</h1>
      <p>Nous collectons : open_id, access_token (chiffré côté serveur), publish_id, request_id, et des métadonnées d’upload (taille, nom de fichier ou URL source, date).</p>
      <p>Finalité : créer des brouillons de vidéos sur TikTok à la demande de l’utilisateur.</p>
      <p>Conservation : 30 jours maximum pour les journaux techniques et identifiants d’upload, sauf obligation légale contraire.</p>
      <p>Suppression : vous pouvez à tout moment demander la suppression via la page <a className="underline" href="/deletion">/deletion</a> ou le bouton “Supprimer mes données” dans <a className="underline" href="/settings">/settings</a>.</p>
      <p>Contact : <a className="underline" href="mailto:contact@tondomaine.com">contact@tondomaine.com</a></p>
    </main>
  );
}
