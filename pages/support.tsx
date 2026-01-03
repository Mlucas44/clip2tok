export default function Support() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
      <h1 className="h1" style={{ marginBottom: 32 }}>Support</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <section>
          <h2 className="h2" style={{ marginBottom: 12 }}>Besoin d'aide ?</h2>
          <p className="muted">
            Notre équipe support est disponible pour répondre à vos questions concernant StudioReels.
          </p>
          <p className="muted" style={{ marginTop: 16, fontSize: 18 }}>
            <strong>Email :</strong> <a href="mailto:support@mlucas.store" className="underline" style={{ fontWeight: 500 }}>support@mlucas.store</a>
          </p>
        </section>

        <section>
          <h2 className="h2" style={{ marginBottom: 12 }}>Informations à inclure dans votre demande</h2>
          <p className="muted" style={{ marginBottom: 12 }}>
            Pour vous aider plus rapidement, merci d'inclure les informations suivantes :
          </p>
          <ul style={{ marginLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li><strong>Description du problème</strong> : Que s'est-il passé ?</li>
            <li><strong>Étapes de reproduction</strong> : Comment reproduire le problème ?</li>
            <li><strong>Publish ID</strong> (si applicable) : Votre <code style={{ background: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: 4 }}>publish_id</code> TikTok</li>
            <li><strong>Request ID</strong> (si disponible) : Le <code style={{ background: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: 4 }}>request_id</code> dans les détails de l'upload</li>
            <li><strong>Date et heure</strong> : Quand le problème est survenu</li>
            <li><strong>Navigateur et système</strong> : Chrome/Firefox/Safari, Windows/Mac/Linux</li>
          </ul>
        </section>

        <section>
          <h2 className="h2" style={{ marginBottom: 12 }}>Questions fréquentes (FAQ)</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Mon upload est bloqué en "PENDING", que faire ?</h3>
              <p className="muted">
                En mode sandbox TikTok, les uploads peuvent rester en PENDING indéfiniment car l'API sandbox ne traite pas réellement les vidéos.
                En production, si votre upload reste en PENDING plus de 10 minutes, contactez-nous avec votre <code>publish_id</code>.
              </p>
            </div>

            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 600, marginBottom: 8 }}>J'ai l'erreur "too_many_pending", comment la résoudre ?</h3>
              <p className="muted">
                TikTok limite à 5 uploads en attente simultanément. Allez dans votre inbox TikTok et publiez ou supprimez les brouillons en attente,
                puis réessayez après quelques minutes.
              </p>
            </div>

            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Quels formats vidéo sont supportés ?</h3>
              <p className="muted">
                StudioReels accepte les formats vidéo supportés par TikTok : MP4, MOV, WebM, etc.
                La vidéo doit être accessible publiquement via une URL HTTPS. Taille maximale et durée selon les limites TikTok.
              </p>
            </div>

            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Comment supprimer mes données ?</h3>
              <p className="muted">
                Allez sur <a href="/deletion" className="underline">/deletion</a> ou <a href="/settings" className="underline">/settings</a> et cliquez sur "Supprimer mes données".
                Vous pouvez aussi nous contacter directement pour une suppression manuelle.
              </p>
            </div>

            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Mon compte TikTok est-il à risque ?</h3>
              <p className="muted">
                Non. StudioReels utilise l'API officielle TikTok avec OAuth 2.0. Nous ne stockons jamais votre mot de passe TikTok.
                Les vidéos sont envoyées en brouillon uniquement, vous gardez le contrôle total.
              </p>
            </div>

            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Le service est-il gratuit ?</h3>
              <p className="muted">
                Oui, StudioReels est actuellement gratuit pendant la phase bêta.
                Nous nous réservons le droit d'introduire des fonctionnalités payantes à l'avenir.
              </p>
            </div>

            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Je n'arrive pas à me connecter avec TikTok</h3>
              <p className="muted">
                Assurez-vous d'utiliser la version web sur un navigateur moderne (Chrome, Firefox, Safari).
                Si le problème persiste, essayez de vous déconnecter de TikTok puis réessayez. Contactez-nous si l'erreur continue.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="h2" style={{ marginBottom: 12 }}>Autres ressources</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p className="muted">
              <a href="/privacy" className="underline">Politique de confidentialité</a> — Comment nous traitons vos données
            </p>
            <p className="muted">
              <a href="/terms" className="underline">Conditions d'utilisation</a> — Les règles d'utilisation du service
            </p>
            <p className="muted">
              <a href="/deletion" className="underline">Suppression de données</a> — Supprimer votre compte et vos données
            </p>
            <p className="muted">
              <a href="https://developers.tiktok.com/doc/" target="_blank" rel="noopener noreferrer" className="underline">
                Documentation TikTok API
              </a> — Documentation officielle TikTok pour développeurs
            </p>
          </div>
        </section>

        <section style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(0,0,0,0.02)', borderRadius: 8 }}>
          <h3 className="h3" style={{ marginBottom: 12 }}>Vous ne trouvez pas de réponse ?</h3>
          <p className="muted" style={{ marginBottom: 20 }}>
            Notre équipe est là pour vous aider. N'hésitez pas à nous contacter.
          </p>
          <a href="mailto:support@mlucas.store" className="btn primary">Contacter le support</a>
        </section>
      </div>
    </div>
  );
}
