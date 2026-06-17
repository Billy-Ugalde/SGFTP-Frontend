import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    modulePreload: { polyfill: false },
    define: {
      'import.meta.env.REACT_APP_API_URL': JSON.stringify(env.REACT_APP_API_URL)
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react-dom')) return 'react-dom';
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-is')) return 'react-core';
            if (id.includes('node_modules/react-router-dom') || id.includes('node_modules/react-router') || id.includes('node_modules/@remix-run')) return 'router';
            if (id.includes('node_modules/@tanstack/react-query')) return 'react-query';
            if (id.includes('node_modules/@tanstack/react-table')) return 'react-table';
            if (id.includes('node_modules/@tanstack/react-form')) return 'forms';
            if (id.includes('node_modules/react-hook-form')) return 'forms';
            if (id.includes('node_modules/lucide-react')) return 'lucide';
            if (id.includes('node_modules/simple-icons')) return 'simple-icons';
            if (id.includes('node_modules/axios')) return 'axios';
            if (id.includes('node_modules/jspdf') || id.includes('node_modules/html2canvas')) return 'pdf';
            if (id.includes('Modules/Audit/Components/AuditDrawer')) return 'audit-drawer';
            if (id.includes('node_modules/libphonenumber-js')) return 'phone';
            if (id.includes('node_modules/jwt-decode')) return 'auth';
            if (id.includes('node_modules/')) return 'vendor';
          },
        },
      },
      chunkSizeWarningLimit: 600,
    },
  }
})
