import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ConfigErrorAlert } from '../components/ConfigErrorAlert';
import { DomainErrorAlert } from '../components/DomainErrorAlert';
import { FirebaseDebug } from '../components/FirebaseDebug';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfigError, setShowConfigError] = useState(false);
  const [showDomainError, setShowDomainError] = useState(false);
  const navigate = useNavigate();
  const { login, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de la connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setShowConfigError(false);
    setShowDomainError(false);
    setLoading(true);

    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Échec de la connexion avec Google';
      
      // Vérifier le type d'erreur
      if (errorMessage.includes('unauthorized-domain') || errorMessage.includes('DOMAINE NON AUTORISÉ')) {
        setShowDomainError(true);
      } else if (errorMessage.includes('CONFIGURATION_NOT_FOUND') || errorMessage.includes('configurée')) {
        setShowConfigError(true);
      } else {
        setError(errorMessage);
      }
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
            <h1 className="text-3xl font-bold text-cyan-400 mb-2">CONNEXION</h1>
            <div className="h-1 w-20 bg-gradient-to-r from-cyan-500 to-blue-500 mx-auto rounded-full" />
            <p className="mt-4 text-sm text-cyan-200/60 uppercase tracking-wider">Accès au système</p>
          </div>

          {/* Domain Error Alert */}
          {showDomainError && <DomainErrorAlert domain={window.location.hostname} onDismiss={() => setShowDomainError(false)} />}

          {/* Config Error Alert */}
          {showConfigError && !showDomainError && <ConfigErrorAlert onDismiss={() => setShowConfigError(false)} />}

          {/* Error Message */}
          {error && !showConfigError && !showDomainError && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-xs uppercase tracking-wider text-cyan-200/80 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-black/40 border border-cyan-500/30 text-cyan-100 placeholder-cyan-200/30 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                placeholder="utilisateur@exemple.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-xs uppercase tracking-wider text-cyan-200/80">
                  Mot de passe
                </label>
                <Link 
                  to="/forgot-password"
                  className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-black/40 border border-cyan-500/30 text-cyan-100 placeholder-cyan-200/30 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold uppercase tracking-wider hover:from-cyan-400 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)]"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 h-px bg-cyan-500/20" />
            <span className="px-4 text-xs text-cyan-200/40 uppercase tracking-wider">ou</span>
            <div className="flex-1 h-px bg-cyan-500/20" />
          </div>

          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 rounded-lg bg-white/10 border border-cyan-500/30 text-cyan-100 font-semibold hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuer avec Google
          </button>

          {/* Register Link */}
          <div className="text-center mt-6">
            <p className="text-sm text-cyan-200/60">
              Pas encore de compte ?{' '}
              <Link 
                to="/register" 
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
              >
                S'inscrire
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Decoration */}
        <div className="mt-4 text-center">
          <p className="text-xs text-cyan-200/30 uppercase tracking-[0.3em]">Neural Dash System</p>
        </div>
      </div>

      {/* Debug Tool */}
      <FirebaseDebug />
    </div>
  );
};
