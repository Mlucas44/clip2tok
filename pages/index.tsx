export default function Home(){
  return (
    <main style={{padding:24,fontFamily:'Inter,system-ui',maxWidth:
      760,margin:'0 auto'}}>
      <h1>Clip2Tok Studio</h1>
      <p>Connectez votre compte TikTok et exportez vos vidéos en brouillon
      (Inbox Upload).</p>

      {/* <a href="http://localhost:8787/api/auth/tiktok" style={{display:'inlineblock',padding:'10px 16px',border:'1px solid #ccc',borderRadius:8}}>Se */}
      <a href="https://undaughterly-leonidas-glaringly.ngrok-free.dev/api/auth/tiktok" style={{display:'inlineblock',padding:'10px 16px',border:'1px solid #ccc',borderRadius:8}}>Se
      connecter avec TikTok</a>
      <section style={{marginTop:24}}>
        <h2>Pages utiles</h2>
        <ul>
          <li><a href="/privacy">Confidentialité</a></li>
          <li><a href="/terms">Conditions</a></li>
          <li><a href="/support">Support</a></li>
          <li><a href="/deletion">Suppression de données</a></li>
        </ul>
      </section>
    </main>
  );
}
