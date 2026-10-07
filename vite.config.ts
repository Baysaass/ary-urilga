import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { createInvitationApi } from './server/invitation-api';
import express, { type Request, type Response } from 'express';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), {
      name: 'invitation-api',
      configureServer(server) {
        const api = express().use('/api/invitation', createInvitationApi());
        server.middlewares.use((req, res, next) => api(req as Request, res as Response, next));
      },
      configurePreviewServer(server) {
        const api = express().use('/api/invitation', createInvitationApi());
        server.middlewares.use((req, res, next) => api(req as Request, res as Response, next));
      },
    }],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
