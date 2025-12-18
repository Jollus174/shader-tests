import { useEffect, useState } from 'react';
import { Shader } from '../data/shaderList';
import { shaderList } from '../data/shaderList';
import ToggleButton from './ToggleButton';

// styles
import './Sidebar.css';

interface SidebarProps {
	selectedShaderId: string;
	onSelectShader: (shader: Shader) => void;
}

function Sidebar({ selectedShaderId, onSelectShader }: SidebarProps) {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	const handleToggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen);
	};

	const handleCloseSidebar = () => {
		setIsSidebarOpen(false);
	};

	const handleShaderClick = (shader: Shader) => {
		onSelectShader(shader);
		// Close sidebar on mobile or touch devices when a shader is selected
		if (window.innerWidth < 768) {
			handleCloseSidebar();
		}
	};

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				handleCloseSidebar();
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, []);

	return (
		<>
			<div className={`sidebar-wrapper ${isSidebarOpen ? 'open' : ''}`}>
				<aside className="sidebar">
					<div className="sidebar-content">
						<h2 className="sidebar-title">Shader Demos</h2>
						<nav className="sidebar-nav">
							<div className="shader-list">
								{shaderList.map((shaderGroup) => (
									<div key={shaderGroup.label}>
										<h3 className="shader-list-title">{shaderGroup.label}</h3>
										<ul key={shaderGroup.label} className="shader-list">
											{shaderGroup.shaders.map((shader) => (
												<li key={shader.id} className="shader-item">
													<button
														className={`shader-button ${selectedShaderId === shader.id ? 'active' : ''}`}
														onClick={() => handleShaderClick(shader)}
													>
														<span className="shader-name">{shader.name}</span>
														{shader.description && <span className="shader-description">{shader.description}</span>}
													</button>
												</li>
											))}
										</ul>
									</div>
								))}
							</div>
						</nav>
					</div>
					<ToggleButton isOpen={isSidebarOpen} onClick={handleToggleSidebar} />
				</aside>
			</div>
		</>
	);
}

export default Sidebar;
