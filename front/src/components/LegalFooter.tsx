import { Link } from 'react-router-dom';

export const LegalFooter = () => {
  return (
    <footer className="bg-[#03070b]/80 border-t border-cyan-500/20 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Copyright */}
          <div className="text-xs text-cyan-200/40">
            © {new Date().getFullYear()} Neural Dash. Tous droits réservés.
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <Link 
              to="/terms" 
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              CGU
            </Link>
            <span className="text-cyan-500/30">•</span>
            <Link 
              to="/privacy-policy" 
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Politique de confidentialité
            </Link>
            <span className="text-cyan-500/30">•</span>
            <button 
              onClick={() => {
                localStorage.removeItem('cookieConsent');
                window.location.reload();
              }}
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Gérer les cookies
            </button>
            <span className="text-cyan-500/30">•</span>
            <a 
              href="https://www.cnil.fr" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              RGPD/CNIL
            </a>
          </div>

          {/* RGPD Badge */}
          <div className="flex items-center gap-2 text-xs">
            <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-cyan-200/60">Conforme RGPD</span>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-4 pt-4 border-t border-cyan-500/10 text-center">
          <p className="text-xs text-cyan-200/30">
            Hébergé par Firebase (Google Cloud) - Données stockées dans l'Union Européenne
          </p>
        </div>
      </div>
    </footer>
  );
};
