import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../lib/firebase';

const getFirebaseAuthMessage = (err: unknown, mode: 'register' | 'login' | 'signOut' | 'google') => {
  const errorCode = (err as { code?: string })?.code;
  const errorMessage = err instanceof Error ? err.message : '';

  if (mode === 'register') {
    if (errorCode === 'auth/email-already-in-use') {
      return 'Cette adresse email est déjà utilisée.';
    }
    if (errorCode === 'auth/invalid-email') {
      return 'Adresse email invalide.';
    }
    if (errorCode === 'auth/weak-password') {
      return 'Le mot de passe est trop faible. Utilisez au moins 6 caractères.';
    }
    if (errorCode === 'auth/operation-not-allowed') {
      return 'L’inscription par email/mot de passe n’est pas activée dans Firebase.';
    }
    if (errorCode === 'auth/network-request-failed') {
      return 'Erreur réseau. Vérifiez votre connexion Internet.';
    }
    if (errorCode === 'auth/too-many-requests') {
      return 'Trop de tentatives. Réessayez plus tard.';
    }
  }

  if (mode === 'login') {
    if (errorCode === 'auth/invalid-credential') {
      return 'Email ou mot de passe incorrect.';
    }
    if (errorCode === 'auth/user-disabled') {
      return 'Ce compte a été désactivé.';
    }
    if (errorCode === 'auth/invalid-email') {
      return 'Adresse email invalide.';
    }
    if (errorCode === 'auth/network-request-failed') {
      return 'Erreur réseau. Vérifiez votre connexion Internet.';
    }
    if (errorCode === 'auth/too-many-requests') {
      return 'Trop de tentatives. Réessayez plus tard.';
    }
  }

  if (mode === 'signOut' && errorCode === 'auth/network-request-failed') {
    return 'Déconnexion impossible pour le moment à cause d’un problème réseau.';
  }

  if (mode === 'google' && errorCode === 'auth/network-request-failed') {
    return '⚠️ Erreur réseau. Vérifiez votre connexion Internet.';
  }

  return errorMessage || 'Une erreur est survenue';
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const register = async (email: string, password: string) => {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err) {
      const message = getFirebaseAuthMessage(err, 'register');
      console.error('🔴 Erreur inscription Firebase:', {
        errorCode: (err as { code?: string })?.code,
        errorMessage: err instanceof Error ? err.message : '',
        err,
      });
      setError(message);
      throw new Error(message);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err) {
      const message = getFirebaseAuthMessage(err, 'login');
      console.error('🔴 Erreur connexion Firebase:', {
        errorCode: (err as { code?: string })?.code,
        errorMessage: err instanceof Error ? err.message : '',
        err,
      });
      setError(message);
      throw new Error(message);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await firebaseSignOut(auth);
    } catch (err) {
      const message = getFirebaseAuthMessage(err, 'signOut');
      setError(message);
      throw new Error(message);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      return userCredential.user;
    } catch (err) {
      const errorCode = (err as { code?: string })?.code;
      const errorMessage = err instanceof Error ? err.message : '';
      let message = 'Une erreur est survenue';
      
      // Gestion détaillée des erreurs
      if (errorCode === 'auth/configuration-not-found' || 
          errorMessage.includes('CONFIGURATION_NOT_FOUND')) {
        message = '⚠️ L\'authentification Google n\'est pas configurée. Veuillez activer Google Sign-In dans la console Firebase (Authentication > Sign-in method > Google).';
      } else if (errorCode === 'auth/unauthorized-domain' || 
                 errorMessage.includes('unauthorized-domain')) {
        const currentDomain = window.location.hostname;
        message = `⚠️ DOMAINE NON AUTORISÉ (${currentDomain})\n\n` +
                  `🔧 SOLUTION RAPIDE:\n` +
                  `1. Ouvrez: https://console.firebase.google.com/project/neuraldash-ba1c4/authentication/settings\n` +
                  `2. Section "Domaines autorisés"\n` +
                  `3. Cliquez "Ajouter un domaine"\n` +
                  `4. Ajoutez: ${currentDomain}\n` +
                  `5. Enregistrez et réessayez\n\n` +
                  `OU utilisez http://localhost:5173 au lieu de http://${currentDomain}:5173`;
      } else if (errorCode === 'auth/popup-closed-by-user') {
        message = 'Connexion annulée.';
      } else if (errorCode === 'auth/popup-blocked') {
        message = '⚠️ Les popups sont bloquées. Veuillez autoriser les popups pour ce site dans les paramètres de votre navigateur.';
      } else if (errorCode === 'auth/cancelled-popup-request') {
        message = 'Connexion annulée. Une autre popup est déjà ouverte.';
      } else if (errorMessage.includes('redirect_uri_mismatch')) {
        message = '⚠️ URI de redirection non configuré. Ajoutez "http://localhost:5173/__/auth/handler" dans Google Cloud Console > APIs et services > Identifiants > URI de redirection autorisés.';
      } else if (errorCode === 'auth/network-request-failed') {
        message = '⚠️ Erreur réseau. Vérifiez votre connexion Internet.';
      } else if (errorCode) {
        message = `Erreur: ${errorCode}. Consultez DEPANNAGE_GOOGLE.md pour plus d'aide.`;
      } else {
        message = errorMessage || message;
      }
      
      console.error('🔴 Erreur Google Sign-In:', { errorCode, errorMessage, err });
      setError(message);
      throw new Error(message);
    }
  };

  return {
    user,
    loading,
    error,
    register,
    login,
    signOut,
    signInWithGoogle
  };
};
