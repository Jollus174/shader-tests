import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { shaderList } from '../data/shaderList';
import ToggleButton from './ToggleButton';

// styles
import './Sidebar.css';

interface SidebarProps {
	selectedShaderId: string;
}

export type ComplexityLevel = 'Basic' | 'Intermediate';

function Sidebar({ selectedShaderId }: SidebarProps) {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const initialComplexityLevel = shaderList.find((shaderGroup) =>
		shaderGroup.shaderList.some((shaderGroup) => shaderGroup.shaders.some((shader) => shader.id === selectedShaderId))
	)?.label; // depends on what's selected in the URL
	const [complexityLevel, setComplexityLevel] = useState<ComplexityLevel>(initialComplexityLevel || 'Basic');

	const handleToggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen);
	};

	const handleCloseSidebar = () => {
		setIsSidebarOpen(false);
	};

	const handleShaderClick = () => {
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
		<div className={`sidebar-wrapper ${isSidebarOpen ? 'open' : ''}`}>
			<aside className="sidebar">
				<div className="sidebar-content">
					<h2 className="sidebar-title">Shader Demos</h2>
					<div className="dropdown-selector">
						<label htmlFor="complexity-select" className="dropdown-label">
							Complexity Level
						</label>
						<select
							id="complexity-select"
							className="dropdown-select"
							value={complexityLevel}
							onChange={(e) => setComplexityLevel(e.target.value as ComplexityLevel)}
						>
							<option value="Basic">Basic</option>
							<option value="Intermediate">Intermediate</option>
						</select>
					</div>
					{shaderList
						.find((shaderGroup) => shaderGroup.label === complexityLevel)
						?.shaderList.map((shaderGroup) => (
							<nav key={shaderGroup.label}>
								<h3 className="shader-list-title">{shaderGroup.label}</h3>
								<ul className="shader-list">
									{shaderGroup.shaders.map((shader) => (
										<li key={shader.id} className="shader-item">
											<Link
												to={`/${shader.id}`}
												className={`shader-button ${selectedShaderId === shader.id ? 'active' : ''}`}
												onClick={handleShaderClick}
											>
												<span className="shader-name">{shader.name}</span>
												{shader.description && <span className="shader-description">{shader.description}</span>}
											</Link>
										</li>
									))}
								</ul>
							</nav>
						))}
				</div>
				<ToggleButton isOpen={isSidebarOpen} onClick={handleToggleSidebar} />
			</aside>
		</div>
	);
}

export default Sidebar;
