import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { fetchSignInMethodsForEmail, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError('Veuillez entrer une adresse email.');
      setLoading(false);
      return;
    }

    try {
      console.log('[ForgotPassword] Envoi email de réinitialisation à :', normalizedEmail);

      const signInMethods = await fetchSignInMethodsForEmail(auth, normalizedEmail);
      console.log('[ForgotPassword] Méthodes de connexion détectées :', signInMethods);

      if (signInMethods.length > 0 && !signInMethods.includes('password')) {
        setError('Ce compte utilise Google pour se connecter. Utilisez "Continuer avec Google" au lieu de réinitialiser un mot de passe.');
        return;
      }

      auth.languageCode = 'fr';
      await sendPasswordResetEmail(auth, normalizedEmail, {
        url: window.location.origin + '/login',
        handleCodeInApp: false,
      });
      console.log('[ForgotPassword] Email envoyé avec succès pour :', normalizedEmail);
      setSuccess(true);
      setEmail('');
    } catch (err) {
      const errorCode = (err as { code?: string })?.code;
      console.error('[ForgotPassword] Erreur Firebase :', errorCode, err);
      let message = 'Une erreur est survenue';

      if (errorCode === 'auth/user-not-found') {
        message = 'Aucun compte n\'existe avec cet email.';
      } else if (errorCode === 'auth/invalid-email') {
        message = 'Email invalide.';
      } else if (errorCode === 'auth/too-many-requests') {
        message = 'Trop de tentatives. Réessayez plus tard.';
      } else if (errorCode === 'auth/missing-email') {
        message = 'Veuillez entrer une adresse email.';
      } else if (errorCode) {
        message = `Erreur Firebase : ${errorCode}`;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#03070b] text-cyan-200 flex items-center justify-center px-4">
      {/* Effets de fond */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.08),transparent_70%)]" />
      <div className="absolute inset-0 opacity-10" 
           style={{ 
             backgroundImage: 'linear-gradient(90deg, rgba(34,211,238,0.35) 1px, transparent 1px), linear-gradient(rgba(34,211,238,0.35) 1px, transparent 1px)', 
             backgroundSize: '60px 60px' 
           }} 
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="border border-cyan-500/30 rounded-3xl bg-[#050b12]/90 backdrop-blur-xl p-8 shadow-[0_0_60px_rgba(0,0,0,0.8)]">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block p-4 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-4">
              <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-cyan-400 mb-2">Mot de passe oublié</h1>
            <div className="h-1 w-20 bg-linear-to-r from-cyan-500 to-blue-500 mx-auto rounded-full" />
            <p className="mt-4 text-sm text-cyan-200/60">
              Entrez votre email pour recevoir un lien de réinitialisation
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-green-400 font-semibold mb-1">Email envoyé !</p>
                  <p className="text-green-200/90 text-sm">
                    Consultez votre boîte mail et suivez les instructions pour réinitialiser votre mot de passe.
                    Si vous avez fait plusieurs demandes, utilisez uniquement le dernier email reçu : les anciens liens deviennent invalides.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-xs uppercase tracking-wider text-cyan-200/80 mb-2">
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={success}
                className="w-full px-4 py-3 rounded-lg bg-black/40 border border-cyan-500/30 text-cyan-100 placeholder-cyan-200/30 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 disabled:opacity-50 transition-all"
                placeholder="utilisateur@exemple.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3 rounded-lg bg-linear-to-r from-cyan-500 to-blue-500 text-white font-semibold uppercase tracking-wider hover:from-cyan-400 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)]"
            >
              {loading ? 'Envoi en cours...' : success ? 'Email envoyé ✓' : 'Envoyer le lien'}
            </button>
          </form>

          {/* Info box */}
          <div className="mt-6 p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <p className="text-xs text-cyan-200/70">
              <strong className="text-cyan-300">Astuce :</strong> Le lien de réinitialisation est valable 1 heure.
              Si plusieurs emails ont été demandés, seul le plus récent fonctionne.
              Si votre compte a été créé avec Google, la réinitialisation par mot de passe ne s'applique pas.
            </p>
          </div>

          {/* Back to login */}
          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="text-sm text-cyan-400 hover:text-cyan-300 font-semibold transition-colors inline-flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour à la connexion
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-xs text-cyan-200/30 uppercase tracking-[0.3em]">Neural Dash System</p>
        </div>
      </div>
    </div>
  );
};
