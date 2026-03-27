interface ConfigErrorAlertProps {
  onDismiss?: () => void;
}

export const ConfigErrorAlert = ({ onDismiss }: ConfigErrorAlertProps) => {
  return (
    <div className="mb-6 p-6 rounded-lg bg-orange-500/10 border-2 border-orange-500/40">
      <div className="flex items-start gap-3">
        <div className="text-orange-400 text-2xl">🔧</div>
        <div className="flex-1">
          <h3 className="text-orange-400 font-bold text-lg mb-2">
            Configuration Google requise
          </h3>
          <p className="text-orange-200/90 text-sm mb-4">
            Le bouton Google ne fonctionne pas encore. Voici la solution :
          </p>
          
          <div className="bg-black/40 rounded-lg p-4 mb-4 border border-orange-500/20">
            <p className="text-xs text-cyan-400 font-bold mb-3 uppercase tracking-wider">
              🎯 Étape critique manquante :
            </p>
            <div className="space-y-3">
              <div className="flex gap-2">
                <span className="text-orange-400 font-bold">1.</span>
                <div className="flex-1">
                  <p className="text-sm text-cyan-200">
                    Ouvrez <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline hover:text-cyan-300 font-semibold">Google Cloud Console</a>
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <span className="text-orange-400 font-bold">2.</span>
                <div className="flex-1">
                  <p className="text-sm text-cyan-200 mb-1">
                    Menu ☰ → <strong className="text-cyan-300">APIs et services</strong> → <strong className="text-cyan-300">Identifiants</strong>
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <span className="text-orange-400 font-bold">3.</span>
                <div className="flex-1">
                  <p className="text-sm text-cyan-200 mb-2">
                    Trouvez votre ID client OAuth et cliquez sur <strong className="text-cyan-300">✏️ Modifier</strong>
                  </p>
                  <code className="text-[10px] text-cyan-400/70 font-mono break-all block bg-black/30 p-2 rounded">
                    806965697824-bq5h0qt443s279uhv6oere426q26tb49...
                  </code>
                </div>
              </div>

              <div className="flex gap-2">
                <span className="text-orange-400 font-bold">4.</span>
                <div className="flex-1">
                  <p className="text-sm text-cyan-200 mb-2">
                    <strong className="text-cyan-300">URI de redirection autorisés</strong> - Ajoutez :
                  </p>
                  <div className="bg-black/30 p-3 rounded space-y-1">
                    <code className="text-[10px] text-green-400 font-mono block">✓ http://localhost:5173</code>
                    <code className="text-[10px] text-green-400 font-mono block">✓ http://localhost:5173/__/auth/handler</code>
                    <code className="text-[10px] text-green-400 font-mono block">✓ https://neuraldash-ba1c4.firebaseapp.com/__/auth/handler</code>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <span className="text-orange-400 font-bold">5.</span>
                <div className="flex-1">
                  <p className="text-sm text-cyan-200 mb-2">
                    <strong className="text-cyan-300">Origines JavaScript autorisées</strong> - Ajoutez :
                  </p>
                  <div className="bg-black/30 p-3 rounded space-y-1">
                    <code className="text-[10px] text-green-400 font-mono block">✓ http://localhost:5173</code>
                    <code className="text-[10px] text-green-400 font-mono block">✓ https://neuraldash-ba1c4.firebaseapp.com</code>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <span className="text-orange-400 font-bold">6.</span>
                <div className="flex-1">
                  <p className="text-sm text-cyan-200">
                    Cliquez sur <strong className="text-cyan-300">ENREGISTRER</strong> et attendez <strong className="text-orange-300">5 minutes</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <details className="mb-3">
            <summary className="text-xs text-cyan-400 cursor-pointer hover:text-cyan-300 mb-2 font-semibold">
              📖 Guide complet de dépannage
            </summary>
            <div className="bg-black/30 rounded p-3 mt-2 text-xs text-cyan-200/80 space-y-2">
              <p>➤ Consultez le fichier <code className="text-cyan-400 bg-black/40 px-1 rounded">DEPANNAGE_GOOGLE.md</code> à la racine du projet</p>
              <p>➤ Vérifiez que Google est activé dans Firebase Authentication</p>
              <p>➤ Assurez-vous d'avoir attendu 5-10 minutes après les changements</p>
              <p>➤ Videz le cache de votre navigateur (Ctrl+Shift+Suppr)</p>
              <p>➤ Essayez en mode navigation privée</p>
            </div>
          </details>

          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1 bg-orange-500/20"></div>
            <span className="text-xs text-orange-300/60 uppercase tracking-wider">En attendant</span>
            <div className="h-px flex-1 bg-orange-500/20"></div>
          </div>

          <p className="text-sm text-cyan-200/90 mb-3 bg-cyan-500/10 border border-cyan-500/20 rounded p-3">
            💡 <strong>Solution temporaire:</strong> Utilisez l'inscription/connexion par <strong className="text-cyan-300">email et mot de passe</strong> ci-dessous (fonctionne immédiatement).
          </p>

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-xs text-orange-400/80 hover:text-orange-300 underline"
            >
              Masquer ce message
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
