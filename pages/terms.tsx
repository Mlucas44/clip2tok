export default function Terms() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
      <h1 className="h1" style={{ marginBottom: 32 }}>Conditions d'utilisation</h1>
      <p className="muted">
        Les présentes Conditions d’utilisation régissent l’utilisation de l’application StudioReels.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <section>
          <h2 className="h2" style={{ marginBottom: 12 }}>1. Acceptation des conditions</h2>
          <p className="muted">
            En utilisant StudioReels, vous acceptez les présentes conditions d'utilisation.
            Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser le service.
          </p>
        </section>

        <section>
          <h2 className="h2" style={{ marginBottom: 12 }}>2. Description du service</h2>
          <p className="muted">
            StudioReels est un service web gratuit en version bêta qui permet aux utilisateurs d'envoyer des vidéos
            en brouillon sur TikTok via l'API officielle TikTok Content Posting (v2).
          </p>
          <p className="muted" style={{ marginTop: 12 }}>
            Le service permet uniquement l'upload de vidéos en <strong>mode brouillon</strong>. Vous conservez le contrôle
            total sur la publication finale depuis votre compte TikTok.
          </p>
        </section>

        <section>
          <h2 className="h2" style={{ marginBottom: 12 }}>3. Version bêta - Limitations</h2>
          <p className="muted">
            StudioReels est actuellement en <strong>version bêta</strong>. Cela signifie que :
          </p>
          <ul style={{ marginTop: 12, marginLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>Le service peut connaître des interruptions, bugs ou dysfonctionnements</li>
            <li>Les fonctionnalités peuvent évoluer, être modifiées ou retirées sans préavis</li>
            <li>L'accès peut être limité ou restreint à certains utilisateurs (whitelist)</li>
            <li>Le service peut être interrompu définitivement à tout moment</li>
            <li>Aucune garantie de disponibilité (SLA) n'est fournie</li>
          </ul>
        </section>

        <section>
          <h2 className="h2" style={{ marginBottom: 12 }}>4. Responsabilités de l'utilisateur</h2>
          <p className="muted">
            En utilisant StudioReels, vous vous engagez à :
          </p>
          <ul style={{ marginTop: 12, marginLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li><strong>Respecter les règles TikTok</strong> : Vos contenus doivent être conformes aux{' '}
              <a href="https://www.tiktok.com/community-guidelines" target="_blank" rel="noopener noreferrer" className="underline">
                Community Guidelines TikTok
              </a>
            </li>
            <li><strong>Être propriétaire des contenus</strong> : Vous devez avoir les droits sur toutes les vidéos que vous uploadez</li>
            <li><strong>Ne pas abuser du service</strong> : Pas de spam, d'automatisation excessive, ou d'utilisation frauduleuse</li>
            <li><strong>Utiliser des URLs publiques valides</strong> : Les vidéos doivent être accessibles publiquement via HTTPS</li>
            <li><strong>Respecter les limites TikTok</strong> : Maximum 5 uploads en attente simultanément</li>
          </ul>
          <p className="muted" style={{ marginTop: 12 }}>
            Vous conservez l'entière responsabilité de vos contenus et de leur conformité aux lois applicables.
            Nous ne modérons pas les contenus avant leur envoi à TikTok.
          </p>
        </section>

        <section>
          <h2 className="h2" style={{ marginBottom: 12 }}>5. Utilisation des données</h2>
          <p className="muted">
            Nous n'utilisons vos données que pour fournir la fonctionnalité d'upload en brouillon.
            Consultez notre <a href="/privacy" className="underline">politique de confidentialité</a> pour plus de détails.
          </p>
          <p className="muted" style={{ marginTop: 12 }}>
            Nous ne :
          </p>
          <ul style={{ marginTop: 8, marginLeft: 20 }}>
            <li>Publions pas vos vidéos sans votre action explicite (mode brouillon uniquement)</li>
            <li>Conservons pas vos vidéos sur nos serveurs (upload direct vers TikTok)</li>
            <li>Vendons pas vos données à des tiers</li>
            <li>Utilisons pas vos contenus à des fins commerciales</li>
          </ul>
        </section>

        <section>
          <h2 className="h2" style={{ marginBottom: 12 }}>6. Limitations de garantie</h2>
          <p className="muted">
            Le service est fourni "tel quel" sans garantie d'aucune sorte. Nous ne garantissons pas :
          </p>
          <ul style={{ marginTop: 12, marginLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>La disponibilité continue du service</li>
            <li>L'absence d'erreurs ou de bugs</li>
            <li>La compatibilité avec tous les formats vidéo</li>
            <li>Le succès de tous les uploads (dépend de TikTok)</li>
            <li>La conservation permanente de vos données</li>
          </ul>
        </section>

        <section>
          <h2 className="h2" style={{ marginBottom: 12 }}>7. Limitation de responsabilité</h2>
          <p className="muted">
            Dans toute la mesure permise par la loi, StudioReels et ses opérateurs ne peuvent être tenus responsables de :
          </p>
          <ul style={{ marginTop: 12, marginLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>Perte de données, contenus ou accès à votre compte TikTok</li>
            <li>Sanctions de TikTok (bannissement, restriction, etc.) liées à vos contenus</li>
            <li>Dommages indirects, perte de revenus ou manque à gagner</li>
            <li>Interruptions du service ou dysfonctionnements</li>
            <li>Actions de tiers (TikTok, hébergeurs, etc.)</li>
          </ul>
        </section>

        <section>
          <h2 className="h2" style={{ marginBottom: 12 }}>8. Suspension et résiliation</h2>
          <p className="muted">
            Nous nous réservons le droit de suspendre ou résilier votre accès à StudioReels à tout moment, sans préavis,
            notamment en cas de :
          </p>
          <ul style={{ marginTop: 12, marginLeft: 20 }}>
            <li>Violation de ces conditions d'utilisation</li>
            <li>Abus du service (spam, automatisation excessive)</li>
            <li>Contenus illégaux ou contraires aux règles TikTok</li>
            <li>Demande de votre part (via <a href="/deletion" className="underline">/deletion</a>)</li>
          </ul>
        </section>

        <section>
          <h2 className="h2" style={{ marginBottom: 12 }}>9. Modifications des conditions</h2>
          <p className="muted">
            Nous pouvons modifier ces conditions à tout moment. Les modifications substantielles seront communiquées
            via cette page. Votre utilisation continue du service après modification vaut acceptation des nouvelles conditions.
          </p>
          <p className="muted" style={{ marginTop: 12 }}>
            Date de dernière mise à jour : <strong>2 janvier 2026</strong>
          </p>
        </section>

        <section>
          <h2 className="h2" style={{ marginBottom: 12 }}>10. Droit applicable</h2>
          <p className="muted">
            Les présentes conditions sont régies par le droit français. Tout litige sera soumis aux tribunaux compétents.
          </p>
        </section>

        <section>
          <h2 className="h2" style={{ marginBottom: 12 }}>11. Contact</h2>
          <p className="muted">
            Pour toute question concernant ces conditions, contactez-nous à :
          </p>
          <p className="muted" style={{ marginTop: 12 }}>
            Email : <a href="mailto:support@mlucas.store" className="underline" style={{ fontWeight: 500 }}>support@mlucas.store</a>
          </p>
        </section>
      </div>
    </div>
  );
}
