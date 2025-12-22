import { useMemo } from 'react';
import { Routes, Route, useParams, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ShaderViewer from './components/ShaderViewer';
import { shaderList, Shader } from './data/shaderList';
import { useShader } from './hooks/useShader';

// styles
import './App.css';

// Helper function to find shader by ID
function findShaderById(id: string): Shader | null {
	for (const group of shaderList) {
		const shader = group.shaders.find((s) => s.id === id);
		if (shader) return shader;
	}
	return null;
}

// Get default shader
const defaultShader = shaderList[1].shaders[0];

function ShaderRoute() {
	const { shaderId } = useParams<{ shaderId?: string }>();
	const selectedShader = useMemo(() => {
		if (shaderId) {
			const shader = findShaderById(shaderId);
			if (shader) return shader;
		}
		return defaultShader;
	}, [shaderId]);

	const { shaderCode, version: shaderVersion } = useShader(selectedShader);

	// Redirect if invalid shader ID
	if (shaderId && !findShaderById(shaderId)) {
		return <Navigate to={`/${defaultShader.id}`} replace />;
	}

	return (
		<div className="app">
			<Sidebar selectedShaderId={selectedShader.id} />
			<main className="main-content">
				<div className="shader-container">
					{shaderCode ? (
						<ShaderViewer key={shaderVersion} shaderCode={shaderCode} />
					) : (
						<div className="loading">Loading shader...</div>
					)}
				</div>
			</main>
		</div>
	);
}

function App() {
	return (
		<Routes>
			<Route path="/" element={<Navigate to={`/${defaultShader.id}`} replace />} />
			<Route path="/:shaderId" element={<ShaderRoute />} />
		</Routes>
	);
}

export default App;
