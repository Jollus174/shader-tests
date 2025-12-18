import { useState } from 'react';
import Sidebar from './components/Sidebar';
import ShaderViewer from './components/ShaderViewer';
import { shaderList, Shader } from './data/shaderList';
import { useShader } from './hooks/useShader';

// styles
import './App.css';

function App() {
	const [selectedShader, setSelectedShader] = useState<Shader>(shaderList[1].shaders[0]);
	const { shaderCode, version: shaderVersion } = useShader(selectedShader);

	const handleSelectShader = (shader: Shader) => {
		setSelectedShader(shader);
	};

	return (
		<div className="app">
			<Sidebar selectedShaderId={selectedShader.id} onSelectShader={handleSelectShader} />
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

export default App;
