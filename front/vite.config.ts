import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
  build: {
    // Code splitting agressif
    rollupOptions: {
      output: {
        // Générer des chunks séparés pour chaque page
        manualChunks: (id) => {
          // Pages
          if (id.includes('/pages/Home.tsx')) return 'page-home';
          if (id.includes('/pages/Missions.tsx')) return 'page-missions';
          if (id.includes('/pages/Inventaire.tsx')) return 'page-inventaire';
          if (id.includes('/pages/Aventure.tsx')) return 'page-aventure';
          if (id.includes('/pages/Boutique.tsx')) return 'page-boutique';
          if (id.includes('/pages/Login.tsx')) return 'page-auth';
          if (id.includes('/pages/Register.tsx')) return 'page-auth';
          if (id.includes('/pages/ForgotPassword.tsx')) return 'page-auth';
          
          // Composants réutilisables
          if (id.includes('/components/')) return 'components';
          
          // Hooks
          if (id.includes('/hooks/')) return 'hooks';
          
          // Utilitaires
          if (id.includes('/utils/')) return 'utils';
          
          // Dépendances externes
          if (id.includes('node_modules/firebase')) return 'vendor-firebase';
          if (id.includes('node_modules/react')) return 'vendor-react';
        },
      },
    },
    // Optimiser la taille du bundle
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  // Optimiser les images et autres assets
  assetsInclude: ['**/*.gl'],
})
