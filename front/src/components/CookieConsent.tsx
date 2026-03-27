import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface CookieConsentProps {
  onAccept?: () => void;
}

export const CookieConsent = ({ onAccept }: CookieConsentProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà donné son consentement
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Attendre un peu avant d'afficher pour ne pas être trop intrusif
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookieConsent', JSON.stringify({
      essential: true,
      analytics: true,
      preferences: true,
      date: new Date().toISOString()
    }));
    setIsVisible(false);
    onAccept?.();
  };

  const handleAcceptEssential = () => {
    localStorage.setItem('cookieConsent', JSON.stringify({
      essential: true,
      analytics: false,
      preferences: false,
      date: new Date().toISOString()
    }));
    setIsVisible(false);
    onAccept?.();
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100" />

      {/* Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-101 p-4 md:p-6">
        <div className="max-w-5xl mx-auto bg-[#050b12] border-2 border-cyan-500/40 rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden">
          
          {/* Header */}
          <div className="bg-linear-to-r from-cyan-500/20 to-blue-500/20 border-b border-cyan-500/30 px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🍪</span>
              <h2 className="text-2xl font-bold text-cyan-400">Cookies et Confidentialité</h2>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {!showDetails ? (
              // Vue simple
              <div>
                <p className="text-cyan-200 mb-4 leading-relaxed">
                  Nous utilisons des cookies pour assurer le bon fonctionnement de notre application, 
                  sauvegarder vos préférences et améliorer votre expérience. En cliquant sur "Tout accepter", 
                  vous acceptez l'utilisation de tous les cookies.
                </p>
                
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4 mb-4">
                  <p className="text-sm text-cyan-100/95">
                    <strong className="text-cyan-300">🔒 Vos droits RGPD :</strong> Vous pouvez à tout moment 
                    accéder, modifier ou supprimer vos données personnelles. Consultez notre{' '}
                    <Link to="/privacy-policy" className="text-cyan-400 underline hover:text-cyan-300">
                      Politique de Confidentialité
                    </Link>
                    {' '}pour plus d'informations.
                  </p>
                </div>

                <button
                  onClick={() => setShowDetails(true)}
                  className="text-sm text-cyan-400 hover:text-cyan-300 underline mb-4 block"
                >
                  Personnaliser mes choix →
                </button>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAcceptAll}
                    className="flex-1 px-6 py-3 bg-linear-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg"
                  >
                    Tout accepter
                  </button>
                  <button
                    onClick={handleAcceptEssential}
                    className="flex-1 px-6 py-3 bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-semibold rounded-lg hover:bg-cyan-500/30 transition-all"
                  >
                    Cookies essentiels uniquement
                  </button>
                </div>
              </div>
            ) : (
              // Vue détaillée
              <div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-sm text-cyan-400 hover:text-cyan-300 mb-4 flex items-center gap-1"
                >
                  ← Retour
                </button>

                <p className="text-cyan-200 mb-4">
                  Nous respectons votre vie privée et le RGPD. Choisissez les cookies que vous souhaitez autoriser :
                </p>

                <div className="space-y-4 mb-6">
                  {/* Cookies essentiels */}
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">✅</span>
                        <h3 className="font-bold text-green-400">Cookies essentiels</h3>
                      </div>
                      <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                        Obligatoire
                      </span>
                    </div>
                    <p className="text-sm text-cyan-200/80">
                      Nécessaires au fonctionnement de l'application (authentification, sécurité, session).
                      Ces cookies ne peuvent pas être désactivés.
                    </p>
                  </div>

                  {/* Cookies de préférence */}
                  <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">⚙️</span>
                        <h3 className="font-bold text-cyan-400">Cookies de préférence</h3>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                      </label>
                    </div>
                    <p className="text-sm text-cyan-200/80">
                      Sauvegardent vos préférences (thème, langue, paramètres d'affichage) pour améliorer votre expérience.
                    </p>
                  </div>

                  {/* Cookies analytiques */}
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">📊</span>
                        <h3 className="font-bold text-purple-400">Cookies analytiques</h3>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                      </label>
                    </div>
                    <p className="text-sm text-cyan-200/80">
                      Nous aident à comprendre comment vous utilisez l'application pour l'améliorer (anonymisé, Google Analytics).
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-200/90">
                    <strong className="text-yellow-400">ℹ️ À savoir :</strong> Nous ne vendons jamais vos données. 
                    Vous pouvez modifier vos préférences à tout moment dans les paramètres de votre compte.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAcceptAll}
                    className="flex-1 px-6 py-3 bg-linear-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg"
                  >
                    Confirmer mes choix
                  </button>
                  <button
                    onClick={handleAcceptEssential}
                    className="flex-1 px-6 py-3 bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-semibold rounded-lg hover:bg-cyan-500/30 transition-all"
                  >
                    Refuser les cookies optionnels
                  </button>
                </div>
              </div>
            )}

            {/* Footer links */}
            <div className="mt-6 pt-4 border-t border-cyan-500/20 flex flex-wrap gap-4 justify-center text-xs text-cyan-200/60">
              <Link to="/privacy-policy" className="hover:text-cyan-400 transition-colors">
                Politique de confidentialité
              </Link>
              <span>•</span>
              <Link to="/terms" className="hover:text-cyan-400 transition-colors">
                CGU
              </Link>
              <span>•</span>
              <a 
                href="https://www.cnil.fr/fr/reglement-europeen-protection-donnees" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-cyan-400 transition-colors"
              >
                En savoir plus sur le RGPD
              </a>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};
