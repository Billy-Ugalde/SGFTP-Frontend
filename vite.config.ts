import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    define: {
      'import.meta.env.REACT_APP_API_URL': JSON.stringify(env.REACT_APP_API_URL)
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/lucide-react')) return 'lucide';
            if (id.includes('node_modules/simple-icons')) return 'simple-icons';
            if (id.includes('node_modules/@tanstack/react-query')) return 'react-query';
            if (id.includes('node_modules/@tanstack/react-table')) return 'react-table';
            if (id.includes('node_modules/react-router-dom') || id.includes('node_modules/react-router')) return 'router';
            if (id.includes('node_modules/axios')) return 'axios';
            if (id.includes('node_modules/react-dom')) return 'react-dom';
          },
        },
      },
      chunkSizeWarningLimit: 600,
    },
  }
})
