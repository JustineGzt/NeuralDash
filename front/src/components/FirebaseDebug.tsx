import { useState } from 'react';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider } from 'firebase/auth';

interface DebugInfo {
  firebaseAuth: {
    apiKey: string;
    authDomain?: string;
    projectId?: string;
  };
  googleProvider: {
    providerId: string;
  };
  currentUser: string;
  supportedProviders: string;
}

export const FirebaseDebug = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);

  const checkConfig = () => {
    const config = {
      firebaseAuth: {
        apiKey: auth.app.options.apiKey?.substring(0, 10) + '...',
        authDomain: auth.app.options.authDomain,
        projectId: auth.app.options.projectId,
      },
      googleProvider: {
        providerId: new GoogleAuthProvider().providerId,
      },
      currentUser: auth.currentUser?.email || 'Non connecté',
      supportedProviders: 'Email/Password, Google',
    };
    
    setDebugInfo(config);
    console.log('🔍 Firebase Debug Info:', config);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={checkConfig}
        className="px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs hover:bg-purple-500/30 transition-all"
      >
        🔧 Debug Firebase
      </button>
      
      {debugInfo && (
        <div className="mt-2 p-4 rounded-lg bg-black/90 border border-purple-400/30 max-w-md">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-purple-400 font-bold text-sm">Firebase Config</h3>
            <button 
              onClick={() => setDebugInfo(null)}
              className="text-purple-400 hover:text-purple-300"
            >
              ✕
            </button>
          </div>
          <pre className="text-[10px] text-cyan-200 overflow-auto max-h-96">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
