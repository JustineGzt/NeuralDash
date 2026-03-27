import { Link } from 'react-router-dom';

export const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#03070b] text-cyan-200 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="border border-cyan-500/30 rounded-3xl bg-[#050b12]/90 backdrop-blur-xl p-8 md:p-12">
          
          <Link to="/login" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 mb-6 text-sm">
            ← Retour
          </Link>

          <h1 className="text-4xl font-bold text-cyan-400 mb-2">Politique de Confidentialité</h1>
          <p className="text-sm text-cyan-200/60 mb-8">Dernière mise à jour : 9 mars 2026</p>

          <div className="space-y-8 text-cyan-200/90 text-sm leading-relaxed">
            
            <section>
              <h2 className="text-2xl font-bold text-cyan-300 mb-4">1. Responsable du traitement</h2>
              <p className="mb-3">
                Le responsable du traitement des données personnelles est Neural Dash, accessible via l'application web neuraldash-ba1c4.firebaseapp.com
              </p>
              <p className="bg-cyan-500/10 border border-cyan-500/20 rounded p-4">
                <strong className="text-cyan-300">Contact :</strong> Pour toute question relative à vos données personnelles, 
                vous pouvez nous contacter via les paramètres de votre compte.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cyan-300 mb-4">2. Données collectées</h2>
              <p className="mb-3">Nous collectons et traitons les données suivantes :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-cyan-300">Données d'identification :</strong> Email, mot de passe (chiffré), nom et prénom (si fournis via Google)</li>
                <li><strong className="text-cyan-300">Données de connexion :</strong> Adresse IP, date et heure de connexion</li>
                <li><strong className="text-cyan-300">Données d'utilisation :</strong> Missions complétées, points d'expérience, progression</li>
                <li><strong className="text-cyan-300">Données techniques :</strong> Type de navigateur, système d'exploitation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cyan-300 mb-4">3. Finalités du traitement</h2>
              <p className="mb-3">Vos données sont traitées pour :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Créer et gérer votre compte utilisateur</li>
                <li>Fournir les fonctionnalités de l'application</li>
                <li>Sauvegarder votre progression et vos préférences</li>
                <li>Améliorer nos services et l'expérience utilisateur</li>
                <li>Assurer la sécurité de la plateforme</li>
                <li>Respecter nos obligations légales</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cyan-300 mb-4">4. Base légale du traitement</h2>
              <p className="mb-3">Le traitement de vos données repose sur :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-cyan-300">L'exécution du contrat :</strong> Fourniture des services de l'application</li>
                <li><strong className="text-cyan-300">Votre consentement :</strong> Pour l'utilisation de cookies non essentiels</li>
                <li><strong className="text-cyan-300">Intérêt légitime :</strong> Amélioration de nos services et sécurité</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cyan-300 mb-4">5. Destinataires des données</h2>
              <p className="mb-3">Vos données peuvent être transmises à :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-cyan-300">Firebase (Google) :</strong> Hébergement et authentification</li>
                <li><strong className="text-cyan-300">Services d'analyse :</strong> Google Analytics (si activé)</li>
                <li><strong className="text-cyan-300">Aucun tiers commercial</strong> - Vos données ne sont jamais vendues</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cyan-300 mb-4">6. Durée de conservation</h2>
              <p className="mb-3">Nous conservons vos données :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Pendant toute la durée d'utilisation de votre compte</li>
                <li>3 ans après votre dernière connexion (compte inactif)</li>
                <li>Les données de connexion sont conservées 1 an (obligation légale)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cyan-300 mb-4">7. Vos droits (RGPD)</h2>
              <p className="mb-3">Conformément au RGPD, vous disposez des droits suivants :</p>
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded p-6 space-y-3">
                <p><strong className="text-cyan-300">✓ Droit d'accès :</strong> Obtenir une copie de vos données</p>
                <p><strong className="text-cyan-300">✓ Droit de rectification :</strong> Corriger vos données inexactes</p>
                <p><strong className="text-cyan-300">✓ Droit à l'effacement :</strong> Supprimer votre compte et vos données</p>
                <p><strong className="text-cyan-300">✓ Droit à la limitation :</strong> Limiter le traitement de vos données</p>
                <p><strong className="text-cyan-300">✓ Droit à la portabilité :</strong> Récupérer vos données dans un format structuré</p>
                <p><strong className="text-cyan-300">✓ Droit d'opposition :</strong> S'opposer au traitement de vos données</p>
                <p><strong className="text-cyan-300">✓ Droit de retirer votre consentement</strong> à tout moment</p>
              </div>
              <p className="mt-4 text-cyan-200/80">
                Pour exercer ces droits, contactez-nous via les paramètres de votre compte ou supprimez directement votre compte.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cyan-300 mb-4">8. Sécurité des données</h2>
              <p className="mb-3">Nous mettons en œuvre des mesures de sécurité appropriées :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Chiffrement des mots de passe (bcrypt/Firebase Auth)</li>
                <li>Connexion sécurisée HTTPS/SSL</li>
                <li>Authentification à deux facteurs disponible</li>
                <li>Hébergement sécurisé Firebase (certifié ISO 27001)</li>
                <li>Sauvegardes régulières</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cyan-300 mb-4">9. Cookies</h2>
              <p className="mb-3">Nous utilisons des cookies pour :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-cyan-300">Cookies essentiels :</strong> Authentification et fonctionnement (obligatoires)</li>
                <li><strong className="text-cyan-300">Cookies de préférence :</strong> Sauvegarder vos paramètres (avec consentement)</li>
              </ul>
              <p className="mt-3">Vous pouvez gérer vos préférences de cookies via le bandeau de consentement.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cyan-300 mb-4">10. Transfert de données</h2>
              <p>
                Vos données sont hébergées sur des serveurs Firebase (Google Cloud) situés dans l'Union Européenne. 
                Aucun transfert hors UE n'est effectué sans garanties appropriées (clauses contractuelles types).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cyan-300 mb-4">11. Réclamation</h2>
              <p>
                Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation 
                auprès de la <strong className="text-cyan-300">CNIL (Commission Nationale de l'Informatique et des Libertés)</strong> :
              </p>
              <p className="bg-cyan-500/10 border border-cyan-500/20 rounded p-4 mt-3">
                CNIL - 3 Place de Fontenoy - TSA 80715 - 75334 PARIS CEDEX 07<br/>
                Téléphone : 01 53 73 22 22<br/>
                Site web : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline hover:text-cyan-300">www.cnil.fr</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-cyan-300 mb-4">12. Modifications</h2>
              <p>
                Nous nous réservons le droit de modifier cette politique de confidentialité. 
                Toute modification sera notifiée via l'application et prendra effet immédiatement après publication.
              </p>
            </section>

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
