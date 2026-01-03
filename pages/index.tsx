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
      <section className="hero hero--pattern" style={{ textAlign: 'center', padding: '80px 20px 60px' }}>
        <h1 className="h1" style={{ fontSize: 56, lineHeight: 1.03 }}>
          Importer en brouillon.
          <br />
          <span style={{ color: 'var(--primary)' }}>Simplifiez vos uploads TikTok.</span>
        </h1>

        <p className="muted" style={{ maxWidth: 720, margin: '14px auto 0', fontSize: 17 }}>
          StudioReels vous permet d'envoyer vos vidéos directement en brouillon sur TikTok depuis une URL.
          <br />
          Gagnez du temps et gardez le contrôle avant publication.
        </p>

        <div style={{ marginTop: 28, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/api/auth/tiktok" className="btn primary">Se connecter avec TikTok</a>
          <a href="#features" className="btn">En savoir plus</a>
        </div>
      </section>

      <section id="features" style={{ padding: '60px 20px', maxWidth: 1200, margin: '0 auto' }}>
        <h2 className="h2" style={{ textAlign: 'center', marginBottom: 40 }}>Comment ça marche ?</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
          <div className="card" style={{ textAlign: 'center', padding: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
            <h3 className="h3" style={{ marginBottom: 12 }}>1. Connectez-vous</h3>
            <p className="muted">Authentifiez-vous avec votre compte TikTok en toute sécurité via OAuth 2.0.</p>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📹</div>
            <h3 className="h3" style={{ marginBottom: 12 }}>2. Envoyez l'URL</h3>
            <p className="muted">Collez l'URL publique de votre vidéo (MP4, MOV, etc.) et ajoutez un titre optionnel.</p>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h3 className="h3" style={{ marginBottom: 12 }}>3. Retrouvez en brouillon</h3>
            <p className="muted">Votre vidéo arrive en brouillon dans votre inbox TikTok, prête à être éditée et publiée.</p>
          </div>
        </div>
      </section>

      <section style={{ padding: '60px 20px', backgroundColor: 'rgba(0,0,0,0.02)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 className="h2" style={{ textAlign: 'center', marginBottom: 40 }}>Fonctionnalités</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: 16 }}>
              <div style={{ fontSize: 24 }}>🚀</div>
              <div>
                <h4 style={{ fontWeight: 600, marginBottom: 4 }}>Upload depuis URL</h4>
                <p className="muted">Importez vos vidéos hébergées sur n'importe quel serveur accessible publiquement.</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'start', gap: 16 }}>
              <div style={{ fontSize: 24 }}>⏱️</div>
              <div>
                <h4 style={{ fontWeight: 600, marginBottom: 4 }}>Suivi en temps réel</h4>
                <p className="muted">Suivez le statut de vos uploads avec un système de polling automatique.</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'start', gap: 16 }}>
              <div style={{ fontSize: 24 }}>📝</div>
              <div>
                <h4 style={{ fontWeight: 600, marginBottom: 4 }}>Mode brouillon</h4>
                <p className="muted">Vos vidéos arrivent toujours en brouillon pour vous laisser peaufiner avant publication.</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'start', gap: 16 }}>
              <div style={{ fontSize: 24 }}>🔒</div>
              <div>
                <h4 style={{ fontWeight: 600, marginBottom: 4 }}>Sécurisé</h4>
                <p className="muted">OAuth 2.0, sessions chiffrées, rate limiting, et headers de sécurité (CSP, HSTS).</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'start', gap: 16 }}>
              <div style={{ fontSize: 24 }}>📊</div>
              <div>
                <h4 style={{ fontWeight: 600, marginBottom: 4 }}>Historique local</h4>
                <p className="muted">Gardez une trace de vos uploads précédents dans votre navigateur.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 className="h2" style={{ marginBottom: 20 }}>À propos de StudioReels</h2>
          <p className="muted" style={{ marginBottom: 24 }}>
            StudioReels est un outil web qui facilite l'envoi de vidéos sur TikTok en mode brouillon via l'API officielle TikTok Content Posting.
            Conçu pour les créateurs de contenu qui souhaitent automatiser leurs uploads tout en gardant le contrôle final sur leurs publications.
          </p>
          <p className="muted" style={{ marginBottom: 32, fontSize: 14 }}>
            Service actuellement en bêta. Vos données sont traitées conformément à notre{' '}
            <a href="/privacy" className="underline">politique de confidentialité</a> et nos{' '}
            <a href="/terms" className="underline">conditions d'utilisation</a>.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/privacy" className="btn">Confidentialité</a>
            <a href="/terms" className="btn">Conditions</a>
            <a href="/support" className="btn">Support</a>
          </div>
        </div>
      </section>

      <section style={{ padding: '60px 20px 80px', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.02)' }}>
        <h2 className="h2" style={{ marginBottom: 20 }}>Prêt à simplifier vos uploads TikTok ?</h2>
        <p className="muted" style={{ marginBottom: 28 }}>Connectez-vous avec votre compte TikTok et commencez en quelques secondes.</p>
        <a href="/api/auth/tiktok" className="btn primary" style={{ fontSize: 16, padding: '12px 32px' }}>Commencer maintenant</a>
      </section>
    </>
  );
}
