// pages/_app.tsx
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/auth/me");
        const d = await r.json();
        setAuthed(Boolean(d?.open_id));
      } catch {
        setAuthed(false);
      }
    })();
  }, []);

  return (
    <div className="app-root">
      <header className="site-header">
        <div className="container header-inner">
          <a href="/" className="brand">
            <span className="brand-dot" />
            <span>StudioReels</span>
          </a>

          {/* Nav dynamique */}
          <nav className="nav">
            {authed === null ? (
              // petit “squelette” le temps du fetch
              <span className="btn ghost" style={{ opacity: .6 }}>…</span>
            ) : authed ? (
              <>
                <a className="btn ghost" href="/connected">Connecté</a>
                <a className="btn ghost" href="/settings">Paramètres</a>
                {/* Déconnexion */}
                <a className="btn" href="/api/auth/logout">Se déconnecter</a>
              </>
            ) : (
              // Non connecté → bouton login discret (évite duplication depuis la landing)
              <a className="btn" href="/api/auth/tiktok" style={{ padding: '8px 12px', fontSize: 14, background: 'transparent', border: '1px solid rgba(24,33,60,.06)' }}>
                Se connecter
              </a>
            )}
          </nav>
        </div>
      </header>

          <main className={"container" + ((Component as any).useFullPattern ? " hero--pattern main--full" : "")}>
        <Component {...pageProps} />
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <nav className="footer-links">
            <a href="/privacy">Confidentialité</a>
            <a href="/terms">Conditions</a>
            <a href="/support">Support</a>
            <a href="/deletion">Suppression de données</a>
          </nav>
          <small>© {new Date().getFullYear()} StudioReels</small>
        </div>
      </footer>
    </div>
  );
}
