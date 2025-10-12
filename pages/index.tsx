// pages/index.tsx
import type { GetServerSideProps } from "next";
import { getSession } from "../lib/session";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx.req as any, ctx.res as any);
  const isAuthed = Boolean(session?.user?.open_id);
  // Permettre ?noRedirect=1 pour éviter la redirection si besoin ponctuel
  const noRedirect = ctx.query.noRedirect === "1";
  if (isAuthed && !noRedirect) {
    return { redirect: { destination: "/connected", permanent: false } };
  }
  return { props: {} };
};

export default function Home() {
  return (
    <>
      <section className="hero hero--pattern" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h1 className="h1" style={{ fontSize: 56, lineHeight: 1.03 }}>
          Importer en brouillon.
          <br />
          <span style={{ color: 'var(--primary)' }}>Simplifiez vos uploads TikTok.</span>
        </h1>

        <p className="muted" style={{ maxWidth: 720, margin: '14px auto 0', fontSize: 17 }}>
          Connexion instantanée — Fichier ou URL — Suivi en temps réel.
        </p>

        <div style={{ marginTop: 28, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/api/auth/tiktok" className="btn primary">Se connecter et importer</a>
          <a href="#" className="btn">Voir la démo</a>
        </div>
      </section>

      
    </>
  );
}
