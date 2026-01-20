import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { Routes, Route, useParams, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ShaderViewer from './components/ShaderViewer';
import CodeEditor from './components/CodeEditor';
import CodeToggleButton from './components/CodeToggleButton';
import { shaderList, Shader } from './data/shaderList';
import { useShader } from './hooks/useShader';

// styles
import './components/CodeEditor.css';
import './App.css';

// Helper function to find shader by ID
function findShaderById(id: string): Shader | null {
	const allShaders = shaderList.flatMap((group) => group.shaderList.flatMap((shaderGroup) => shaderGroup.shaders));
	return allShaders.find((s) => s.id === id) || null;
}

// Get default shader
const defaultShader = shaderList[1].shaderList[0].shaders[0];

function ShaderRoute() {
	const { shaderId } = useParams<{ shaderId?: string }>();
	const [isEditorOpen, setIsEditorOpen] = useState(false);
	const [editedShaderCode, setEditedShaderCode] = useState<string | null>(null);
	const [debouncedShaderCode, setDebouncedShaderCode] = useState<string | null>(null);
	const [editorHeight, setEditorHeight] = useState<number | null>(null);
	const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const selectedShader = useMemo(() => {
		if (shaderId) {
			const shader = findShaderById(shaderId);
			if (shader) return shader;
		}
		return defaultShader;
	}, [shaderId]);

	const { shaderCode, version: shaderVersion } = useShader(selectedShader);

	// Use debouncedShaderCode for rendering, editedShaderCode for editor display
	const activeShaderCode = debouncedShaderCode !== null ? debouncedShaderCode : shaderCode;
	const editorValue = editedShaderCode !== null ? editedShaderCode : shaderCode;

	// Sync editedShaderCode and debouncedShaderCode with shaderCode when shader changes
	useEffect(() => {
		if (shaderCode !== null) {
			setEditedShaderCode(shaderCode);
			setDebouncedShaderCode(shaderCode);
			// Clear any pending debounce timer
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
				debounceTimerRef.current = null;
			}
		}
	}, [shaderCode]);

		// Update CSS custom property when editor height changes
	useEffect(() => {
		if (isEditorOpen && editorHeight !== null) {
			document.documentElement.style.setProperty('--code-editor-height', `${editorHeight}px`);
		}
	}, [isEditorOpen, editorHeight]);

	// Debounced handler for editor changes
	const handleEditorChange = useCallback((value: string) => {
		// Update editor value immediately for responsive UI
		setEditedShaderCode(value);

		// Debounce the shader code update to avoid excessive recompilation
		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
		}

		debounceTimerRef.current = setTimeout(() => {
			setDebouncedShaderCode(value);
			debounceTimerRef.current = null;
		}, 400);
	}, []);

	// Cleanup debounce timer on unmount
	useEffect(() => {
		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
		};
	}, []);


	// Redirect if invalid shader ID
	if (shaderId && !findShaderById(shaderId)) {
		return <Navigate to={`/${defaultShader.id}`} replace />;
	}

	return (
		<div className="app">
			<Sidebar selectedShaderId={selectedShader.id} />
			<main className={`main-content ${isEditorOpen ? 'editor-open' : ''}`}>
				<div className="shader-container">
					{activeShaderCode ? (
						<ShaderViewer
							key={shaderVersion}
							shaderCode={activeShaderCode}
							squareAspectRatio={selectedShader.squareAspectRatio}
						/>
					) : (
						<div className="loading">Loading shader...</div>
					)}
				</div>
				{isEditorOpen && editorValue && (
					<div className="code-editor-container">
						<CodeEditor 
							value={editorValue} 
							onChange={handleEditorChange} 
							onHeightChange={setEditorHeight}
							shaderId={selectedShader.id}
						/>
					</div>
				)}
				<CodeToggleButton isOpen={isEditorOpen} onClick={() => setIsEditorOpen((prev) => !prev)} />
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
