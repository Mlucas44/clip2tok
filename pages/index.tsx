// export default function Home() {
//   return (
//     <>
//       <h1 className="h1">Clip2Tok Studio</h1>
//       <p className="muted">Connectez votre compte TikTok et exportez vos vidéos en brouillon (Inbox Upload).</p>

//       <div className="mt16">
//         <a href="/api/auth/tiktok" className="btn primary">Se connecter avec TikTok</a>
//       </div>

//       <div className="card mt32">
//         <h2 className="h2">Accès rapide</h2>
//         <div style={{display:"flex", gap:12, flexWrap:"wrap", marginTop:8}}>
//           <a className="btn" href="/connected">Connected</a>
//           <a className="btn" href="/settings">Paramètres</a>
//         </div>
//       </div>
//     </>
//   );
// }


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
      <h1 className="h1">Clip2Tok Studio</h1>
      <p className="muted">
        Connectez votre compte TikTok et exportez vos vidéos en brouillon (Inbox Upload).
      </p>

      {/* Ce bouton ne s’affichera que si non connecté via le header dynamique (ci-dessous) */}
      <div className="mt16">
        <a href="/api/auth/tiktok" className="btn primary">Se connecter avec TikTok</a>
      </div>

      <div className="card mt32">
        <h2 className="h2">Accès rapide</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
          <a className="btn" href="/connected">Connected</a>
          <a className="btn" href="/settings">Paramètres</a>
        </div>
      </div>

      <section className="card mt24">
        <h2 className="h2">Pages utiles</h2>
        <ul>
          <li><a href="/privacy">Confidentialité</a></li>
          <li><a href="/terms">Conditions</a></li>
          <li><a href="/support">Support</a></li>
          <li><a href="/deletion">Suppression de données</a></li>
          <li><a href="/settings">Paramètres</a></li>
        </ul>
      </section>
    </>
  );
}
