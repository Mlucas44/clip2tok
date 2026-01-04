export default function Privacy() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
      <h1 className="h1" style={{ marginBottom: 32 }}>Politique de confidentialité</h1>
      <p className="muted">
        La présente politique de confidentialité s’applique à l’application StudioReels.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <section>
          <h2 className="h2" style={{ marginBottom: 12 }}>1. Données collectées</h2>
          <p className="muted">
            Lorsque vous utilisez StudioReels, nous collectons les informations suivantes :
          </p>
          <ul style={{ marginTop: 12, marginLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li><strong>Identifiant TikTok</strong> : open_id (identifiant unique TikTok)</li>
            <li><strong>Token d'accès</strong> : access_token (chiffré côté serveur, jamais stocké en clair)</li>
            <li><strong>Métadonnées d'upload</strong> : publish_id, request_id, URL source de la vidéo, titre, date et heure</li>
            <li><strong>Journaux techniques</strong> : adresse IP (pour rate limiting), correlation IDs, logs de requêtes</li>
          </ul>
        </section>

        <section>
          <h2 className="h2" style={{ marginBottom: 12 }}>2. Finalité du traitement</h2>
          <p className="muted">
            Vos données sont utilisées uniquement pour :
          </p>
          <ul style={{ marginTop: 12, marginLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>Authentifier votre compte TikTok via OAuth 2.0</li>
            <li>Créer des brouillons de vidéos sur TikTok à votre demande</li>
            <li>Suivre le statut de vos uploads en temps réel</li>
            <li>Assurer la sécurité et prévenir les abus (rate limiting, CSRF protection)</li>
            <li>Diagnostiquer les problèmes techniques (logs avec correlation IDs)</li>
          </ul>
        </section>

        <section>
          <h2 className="h2" style={{ marginBottom: 12 }}>3. Conservation des données</h2>
          <p className="muted">
            <strong>Sessions actives</strong> : Vos tokens d'accès sont stockés de manière chiffrée dans des cookies de session sécurisés (iron-session).
            Les sessions expirent automatiquement selon la durée de validité définie par TikTok.
          </p>
          <p className="muted" style={{ marginTop: 12 }}>
            <strong>Journaux techniques</strong> : Les logs (correlation IDs, publish_ids, métadonnées d'upload) sont conservés 30 jours maximum,
            sauf obligation légale contraire.
          </p>
          <p className="muted" style={{ marginTop: 12 }}>
            <strong>Historique local</strong> : L'historique de vos uploads est stocké uniquement dans votre navigateur (localStorage) et n'est jamais envoyé à nos serveurs.
          </p>
        </section>

        <section>
          <h2 className="h2" style={{ marginBottom: 12 }}>4. Partage des données</h2>
          <p className="muted">
            Nous ne vendons ni ne partageons vos données personnelles avec des tiers, sauf :
          </p>
          <ul style={{ marginTop: 12, marginLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li><strong>TikTok</strong> : Vos vidéos et métadonnées sont transmises à TikTok via leur API officielle (Content Posting API v2)</li>
            <li><strong>Hébergeur</strong> : Nos serveurs et bases de données sont hébergés chez des prestataires conformes RGPD</li>
            <li><strong>Obligation légale</strong> : En cas de demande judiciaire ou réglementaire</li>
          </ul>
        </section>

        <section>
          <h2 className="h2" style={{ marginBottom: 12 }}>5. Vos droits (RGPD)</h2>
          <p className="muted">
            Conformément au RGPD, vous disposez des droits suivants :
          </p>
          <ul style={{ marginTop: 12, marginLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li><strong>Droit d'accès</strong> : Demander une copie de vos données</li>
            <li><strong>Droit de rectification</strong> : Corriger vos données inexactes</li>
            <li><strong>Droit à l'effacement</strong> : Supprimer vos données (voir page <a href="/deletion" className="underline">/deletion</a>)</li>
            <li><strong>Droit d'opposition</strong> : Vous opposer au traitement de vos données</li>
            <li><strong>Droit à la portabilité</strong> : Recevoir vos données dans un format structuré</li>
          </ul>
          <p className="muted" style={{ marginTop: 12 }}>
            Pour exercer ces droits, vous pouvez à tout moment :
          </p>
          <ul style={{ marginTop: 8, marginLeft: 20 }}>
            <li>Vous déconnecter via le bouton "Se déconnecter" (supprime votre session)</li>
            <li>Supprimer vos données via <a href="/settings" className="underline">/settings</a> ou <a href="/deletion" className="underline">/deletion</a></li>
            <li>Nous contacter à <a href="mailto:support@mlucas.store" className="underline">support@mlucas.store</a></li>
          </ul>
        </section>

        <section>
          <h2 className="h2" style={{ marginBottom: 12 }}>6. Sécurité</h2>
          <p className="muted">
            Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données :
          </p>
          <ul style={{ marginTop: 12, marginLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>Chiffrement des tokens (iron-session avec secret 32+ caractères)</li>
            <li>HTTPS obligatoire en production (HSTS, TLS 1.2+)</li>
            <li>Headers de sécurité (CSP, X-Frame-Options, X-Content-Type-Options)</li>
            <li>Rate limiting (60 req/min par IP sur les endpoints sensibles)</li>
            <li>Protection CSRF (validation de state OAuth)</li>
            <li>Corrélation IDs pour traçabilité des incidents</li>
          </ul>
        </section>

        <section>
          <h2 className="h2" style={{ marginBottom: 12 }}>7. Modifications de cette politique</h2>
          <p className="muted">
            Nous pouvons mettre à jour cette politique de confidentialité. Toute modification substantielle sera communiquée via cette page.
            Date de dernière mise à jour : <strong>2 janvier 2026</strong>
          </p>
        </section>

        <section>
          <h2 className="h2" style={{ marginBottom: 12 }}>8. Contact</h2>
          <p className="muted">
            Pour toute question concernant cette politique ou vos données personnelles, contactez-nous à :
          </p>
          <p className="muted" style={{ marginTop: 12 }}>
            Email : <a href="mailto:support@mlucas.store" className="underline" style={{ fontWeight: 500 }}>support@mlucas.store</a>
          </p>
        </section>
      </div>
    </div>
  );
}
