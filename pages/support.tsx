// app/support/page.tsx
export default function Support() {
  return (
    <main className="mx-auto max-w-2xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Support</h1>
      <p>Besoin d’aide ? Écrivez-nous : <a className="underline" href="mailto:support@mlucas.store">support@mlucas.store</a></p>
      <p>Indiquez si possible votre <span className="font-mono">request_id</span> TikTok.</p>
    </main>
  );
}
