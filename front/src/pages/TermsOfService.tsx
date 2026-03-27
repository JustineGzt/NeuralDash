import { Link } from 'react-router-dom';

export const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-[#03070b] text-cyan-200 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="border border-cyan-500/30 rounded-3xl bg-[#050b12]/90 backdrop-blur-xl p-8 md:p-12">
          
          <Link to="/login" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 mb-6 text-sm">
            ← Retour
          </Link>

          <h1 className="text-4xl font-bold text-cyan-400 mb-2">Conditions Générales d'Utilisation</h1>
          <p className="text-sm text-cyan-200/60 mb-8">Dernière mise à jour : 9 mars 2026</p>

          <div className="space-y-8 text-cyan-200/90 text-sm leading-relaxed">
            
            <section>
              <h2 className="text-2xl font-bold text-cyan-300 mb-4">1. Objet</h2>
              <p>
                Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de l'application web 
                Neural Dash (ci-après "l'Application"), accessible à l'adresse neuraldash-ba1c4.firebaseapp.com.
              </p>
              <p className="mt-3 bg-yellow-500/10 border border-yellow-500/20 rounded p-4">
                <strong className="text-yellow-400">⚠️ Important :</strong> En créant un compte et en utilisant l'Application, 
                vous acceptez sans réserve les présentes CGU.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cyan-300 mb-4">2. Définitions</h2>
              <ul className="space-y-2">
                <li><strong className="text-cyan-300">Utilisateur :</strong> Toute personne utilisant l'Application</li>
                <li><strong className="text-cyan-300">Compte :</strong> Espace personnel créé par l'Utilisateur</li>
                <li><strong className="text-cyan-300">Contenu :</strong> Données, missions, progression générées par l'Utilisateur</li>
                <li><strong className="text-cyan-300">Service :</strong> L'ensemble des fonctionnalités de l'Application</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cyan-300 mb-4">3. Création et gestion du compte</h2>
              
              <h3 className="text-lg font-semibold text-cyan-300 mb-2 mt-4">3.1 Conditions d'inscription</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Vous devez avoir au moins 13 ans pour créer un compte</li>
                <li>Les mineurs de moins de 16 ans doivent obtenir le consentement parental</li>
                <li>Vous devez fournir des informations exactes et à jour</li>
                <li>Un seul compte par personne est autorisé</li>
              </ul>

              <h3 className="text-lg font-semibold text-cyan-300 mb-2 mt-4">3.2 Sécurité du compte</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Vous êtes responsable de la confidentialité de vos identifiants</li>
                <li>Utilisez un mot de passe fort et unique</li>
                <li>Ne partagez jamais vos identifiants avec des tiers</li>
                <li>Signalez immédiatement toute utilisation non autorisée</li>
              </ul>

              <h3 className="text-lg font-semibold text-cyan-300 mb-2 mt-4">3.3 Suppression du compte</h3>
              <p className="ml-4">
                Vous pouvez supprimer votre compte à tout moment via les paramètres. 
                Cette action est irréversible et entraîne la suppression définitive de vos données.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cyan-300 mb-4">4. Utilisation du service</h2>
              
              <h3 className="text-lg font-semibold text-cyan-300 mb-2 mt-4">4.1 Usage autorisé</h3>
              <p className="mb-3">L'Application est destinée à un usage personnel uniquement. Vous vous engagez à :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Utiliser le Service de manière conforme à la loi</li>
                <li>Respecter les droits des autres utilisateurs</li>
                <li>Ne pas utiliser le Service à des fins commerciales sans autorisation</li>
              </ul>

              <h3 className="text-lg font-semibold text-cyan-300 mb-2 mt-4">4.2 Comportements interdits</h3>
              <div className="bg-red-500/10 border border-red-500/20 rounded p-4">
                <p className="font-semibold text-red-400 mb-2">Il est strictement interdit de :</p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-red-200/90">
                  <li>Tenter d'accéder à des comptes d'autres utilisateurs</li>
                  <li>Utiliser des bots, scripts ou outils automatisés</li>
                  <li>Exploiter des failles de sécurité</li>
                  <li>Diffuser des contenus illégaux, offensants ou malveillants</li>
                  <li>Surcharger ou perturber les serveurs</li>
                  <li>Revendre ou transférer votre compte</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cyan-300 mb-4">5. Propriété intellectuelle</h2>
              <p className="mb-3">
                L'Application, son code source, son design, ses textes, images et fonctionnalités sont protégés 
                par le droit d'auteur et autres droits de propriété intellectuelle.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-cyan-300">Vos contenus :</strong> Vous conservez tous les droits sur vos données personnelles et votre progression</li>
                <li><strong className="text-cyan-300">Notre propriété :</strong> Tous les autres éléments restent notre propriété exclusive</li>
                <li><strong className="text-cyan-300">Licence d'utilisation :</strong> Nous vous accordons une licence non exclusive et non transférable pour utiliser l'Application</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cyan-300 mb-4">6. Disponibilité du service</h2>
              <p className="mb-3">
                Nous nous efforçons de maintenir le Service accessible 24h/24, 7j/7. Toutefois :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Des interruptions peuvent survenir pour maintenance ou mises à jour</li>
                <li>Nous ne garantissons pas une disponibilité ininterrompue</li>
                <li>Nous déclinons toute responsabilité en cas d'indisponibilité temporaire</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cyan-300 mb-4">7. Responsabilité</h2>
              
              <h3 className="text-lg font-semibold text-cyan-300 mb-2 mt-4">7.1 Limitation de responsabilité</h3>
              <p className="mb-3">
                L'Application est fournie "en l'état". Nous ne pouvons être tenus responsables :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Des dommages directs ou indirects résultant de l'utilisation du Service</li>
                <li>De la perte de données en cas de défaillance technique</li>
                <li>Des interruptions ou erreurs du Service</li>
              </ul>

              <h3 className="text-lg font-semibold text-cyan-300 mb-2 mt-4">7.2 Sauvegarde</h3>
              <p className="ml-4">
                Nous effectuons des sauvegardes régulières mais vous êtes responsable de conserver 
                vos propres copies de vos données importantes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cyan-300 mb-4">8. Suspension et résiliation</h2>
              <p className="mb-3">Nous nous réservons le droit de :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Suspendre ou résilier votre compte en cas de violation des CGU</li>
                <li>Supprimer tout contenu inapproprié</li>
                <li>Modifier ou interrompre le Service sans préavis</li>
              </ul>
              <p className="mt-3">
                Vous pouvez résilier votre compte à tout moment en le supprimant via les paramètres.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cyan-300 mb-4">9. Protection des données</h2>
              <p>
                Vos données personnelles sont traitées conformément à notre{' '}
                <Link to="/privacy-policy" className="text-cyan-400 underline hover:text-cyan-300">
                  Politique de Confidentialité
                </Link>
                {' '}et au Règlement Général sur la Protection des Données (RGPD).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cyan-300 mb-4">10. Modifications des CGU</h2>
              <p>
                Nous pouvons modifier ces CGU à tout moment. Les modifications prennent effet dès leur publication. 
                Votre utilisation continue du Service après modification constitue votre acceptation des nouvelles CGU.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cyan-300 mb-4">11. Droit applicable et juridiction</h2>
              <p className="mb-3">
                Les présentes CGU sont régies par le droit français. En cas de litige :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Une solution amiable sera recherchée en priorité</li>
                <li>À défaut, les tribunaux français seront seuls compétents</li>
                <li>Vous pouvez recourir à une médiation de la consommation si applicable</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cyan-300 mb-4">12. Contact</h2>
              <p>
                Pour toute question concernant ces CGU, vous pouvez nous contacter via les paramètres de votre compte 
                ou par les coordonnées indiquées dans les mentions légales.
              </p>
            </section>

            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-6 mt-8">
              <p className="text-cyan-300 font-semibold mb-2">📌 Résumé important :</p>
              <ul className="space-y-1 text-xs">
                <li>✓ Soyez respectueux et utilisez le service légalement</li>
                <li>✓ Protégez vos identifiants et utilisez un mot de passe fort</li>
                <li>✓ Vos données sont protégées selon le RGPD</li>
                <li>✓ Vous pouvez supprimer votre compte à tout moment</li>
                <li>✓ En cas de problème, contactez-nous via l'application</li>
              </ul>
            </div>

          </div>

          <div className="mt-12 pt-6 border-t border-cyan-500/20">
            <Link 
              to="/login" 
              className="inline-block px-6 py-3 bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 rounded-lg hover:bg-cyan-500/30 transition-all"
            >
              Retour à la connexion
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};
