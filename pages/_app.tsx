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
            <span>Clip2Tok Studio</span>
          </a>

          {/* Nav dynamique */}
          <nav className="nav">
            {authed === null ? (
              // petit “squelette” le temps du fetch
              <span className="btn ghost" style={{ opacity: .6 }}>…</span>
            ) : authed ? (
              <>
                <a className="btn ghost" href="/connected">Connected</a>
                <a className="btn ghost" href="/settings">Paramètres</a>
                {/* Déconnexion */}
                <a className="btn" href="/api/auth/logout">Se déconnecter</a>
              </>
            ) : (
              // Non connecté → bouton login
              <a className="btn primary" href="/api/auth/tiktok">Se connecter avec TikTok</a>
            )}
          </nav>
        </div>
      </header>

      <main className="container">
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
          <small>© {new Date().getFullYear()} Clip2Tok Studio</small>
        </div>
      </footer>
    </div>
  );
}
