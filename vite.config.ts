import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		// Custom plugin to handle .frag file HMR
		{
			name: 'shader-hmr',
			handleHotUpdate({ file, server }) {
				if (file.endsWith('.frag')) {
					// Notify client about shader file change
					server.ws.send({
						type: 'custom',
						event: 'shader-update',
						data: { file }
					});
				}
			}
		}
	],
	assetsInclude: ['**/*.frag']
	// Allow importing .frag files as raw text using ?raw suffix
});
