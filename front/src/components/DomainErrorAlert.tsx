interface DomainErrorAlertProps {
  domain: string;
  onDismiss?: () => void;
}

export const DomainErrorAlert = ({ domain, onDismiss }: DomainErrorAlertProps) => {
  const isLocalhost = domain === '127.0.0.1';
  const correctUrl = window.location.href.replace('127.0.0.1', 'localhost');

  return (
    <div className="mb-6 p-6 rounded-lg bg-red-500/10 border-2 border-red-500/40 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="text-red-400 text-3xl">🚫</div>
        <div className="flex-1">
          <h3 className="text-red-400 font-bold text-xl mb-2">
            Domaine non autorisé !
          </h3>
          <p className="text-red-200/90 text-base mb-4">
            Vous utilisez <code className="bg-red-500/20 px-2 py-1 rounded text-red-300 font-mono">{domain}</code> mais Firebase autorise uniquement <code className="bg-green-500/20 px-2 py-1 rounded text-green-300 font-mono">localhost</code>
          </p>
          
          {isLocalhost && (
            <div className="bg-gradient-to-r from-green-500/20 to-cyan-500/20 border-2 border-green-500/40 rounded-lg p-5 mb-4">
              <p className="text-green-400 font-bold text-lg mb-3 flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                SOLUTION INSTANTANÉE
              </p>
              <div className="bg-black/40 rounded p-4 mb-3">
                <p className="text-sm text-cyan-200 mb-2">Changez l'URL dans votre navigateur :</p>
                <div className="flex items-center gap-2 mb-2">
                  <code className="text-red-300 bg-red-500/20 px-3 py-2 rounded text-sm font-mono flex-1">
                    ❌ http://127.0.0.1:5173
                  </code>
                  <span className="text-cyan-400 text-xl">→</span>
                  <code className="text-green-300 bg-green-500/20 px-3 py-2 rounded text-sm font-mono flex-1">
                    ✅ http://localhost:5173
                  </code>
                </div>
              </div>
              
              <a
                href={correctUrl}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-cyan-500 text-white font-bold rounded-lg hover:from-green-400 hover:to-cyan-400 transition-all shadow-lg shadow-green-500/30 hover:shadow-green-500/50 text-base"
              >
                <span className="text-xl">🚀</span>
                Ouvrir avec localhost (Cliquez ici !)
              </a>
              
              <p className="text-xs text-cyan-200/60 mt-3">
                💡 Cette solution fonctionne instantanément, sans configuration Firebase
              </p>
            </div>
          )}

          <div className="bg-black/40 rounded-lg p-4 mb-4 border border-yellow-500/30">
            <p className="text-yellow-400 font-bold text-sm mb-3 uppercase tracking-wider flex items-center gap-2">
              <span>🔧</span> Ou configurer Firebase (30 secondes)
            </p>
            <ol className="space-y-2 text-sm text-cyan-200">
              <li className="flex gap-2">
                <span className="text-yellow-400 font-bold min-w-[20px]">1.</span>
                <div>
                  Ouvrez : <a 
                    href="https://console.firebase.google.com/project/neuraldash-ba1c4/authentication/settings" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-cyan-400 underline hover:text-cyan-300 font-semibold break-all"
                  >
                    Firebase Settings → Domaines autorisés
                  </a>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-yellow-400 font-bold min-w-[20px]">2.</span>
                <div>Cliquez sur <strong className="text-cyan-300">"Ajouter un domaine"</strong></div>
              </li>
              <li className="flex gap-2">
                <span className="text-yellow-400 font-bold min-w-[20px]">3.</span>
                <div>
                  Tapez : <code className="bg-cyan-500/20 px-2 py-1 rounded text-cyan-300 font-mono">{domain}</code>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-yellow-400 font-bold min-w-[20px]">4.</span>
                <div>Cliquez sur <strong className="text-cyan-300">"Ajouter"</strong> puis actualisez cette page (F5)</div>
              </li>
            </ol>
          </div>

          <div className="flex items-center gap-3 text-xs text-cyan-200/50 mb-3">
            <div className="h-px flex-1 bg-cyan-500/20"></div>
            <span className="uppercase tracking-wider">Pourquoi ?</span>
            <div className="h-px flex-1 bg-cyan-500/20"></div>
          </div>

          <p className="text-xs text-cyan-200/70 bg-cyan-500/5 border border-cyan-500/20 rounded p-3 mb-3">
            <strong className="text-cyan-300">Info :</strong> <code className="text-cyan-400">localhost</code> et <code className="text-cyan-400">127.0.0.1</code> sont la même chose pour votre ordinateur, mais Firebase les considère comme des domaines différents pour des raisons de sécurité. Par défaut, seul <code className="text-cyan-400">localhost</code> est autorisé.
          </p>

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-xs text-red-400/80 hover:text-red-300 underline"
            >
              Masquer ce message
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
