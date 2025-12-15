import { useState, useEffect } from 'react';
import { Shader } from '../data/shaderList';

export function useShader(selectedShader: Shader) {
	const [shaderCode, setShaderCode] = useState<string | null>(null);
	const [version, setVersion] = useState(0);

	useEffect(() => {
		let isMounted = true;
		let currentModule: Promise<{ default: string }> | null = null;

		const loadShader = async (forceFetch = false) => {
			try {
				if (forceFetch && import.meta.hot) {
					// For HMR updates, fetch directly to bypass module cache
					const fileName = selectedShader.filePath.split('/').pop();
					const response = await fetch(`/src/shaders/${fileName}?t=${Date.now()}`, {
						cache: 'no-store'
					});

					if (response.ok) {
						const code = await response.text();
						if (isMounted) {
							setShaderCode(code);
							setVersion((v) => v + 1);
						}
						return;
					}
				}

				// Normal import for initial load
				currentModule = selectedShader.file();
				const module = await currentModule;

				if (isMounted) {
					setShaderCode(module.default);
					setVersion((v) => v + 1);
				}
			} catch (error) {
				console.error('Error loading shader:', error);
				if (isMounted) {
					setShaderCode(null);
				}
			}
		};

		loadShader();

		// Set up HMR
		if (import.meta.hot) {
			// Listen for custom shader update events from Vite plugin
			import.meta.hot.on('shader-update', (data: { file: string }) => {
				const fileName = selectedShader.filePath.split('/').pop();
				if (data.file.includes(fileName || '') && isMounted) {
					// Fetch directly to bypass cache
					setTimeout(() => {
						if (isMounted) {
							loadShader(true);
						}
					}, 100);
				}
			});

			// Also listen for standard Vite update events as fallback
			const handleUpdate = (update: { updates: Array<{ path: string }> }) => {
				const fileName = selectedShader.filePath.split('/').pop();
				const isCurrentShaderUpdate = update.updates.some(
					(u) => u.path.includes('.frag') && u.path.includes(fileName || '')
				);

				if (isCurrentShaderUpdate && isMounted) {
					setTimeout(() => {
						if (isMounted) {
							loadShader(true);
						}
					}, 100);
				}
			};

			import.meta.hot.on('vite:beforeUpdate', handleUpdate);

			return () => {
				if (import.meta.hot) {
					import.meta.hot.off('shader-update', () => {});
					import.meta.hot.off('vite:beforeUpdate', handleUpdate);
				}
				isMounted = false;
			};
		}

		return () => {
			isMounted = false;
		};
	}, [selectedShader]);

	return { shaderCode, version };
}
