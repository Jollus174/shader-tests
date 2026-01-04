interface ToggleButtonProps {
	isOpen: boolean;
	onClick: () => void;
}

function ToggleButton({ isOpen, onClick }: ToggleButtonProps) {
	return (
		<button
			className="btn toggle-button"
			onClick={onClick}
			aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
			aria-expanded={isOpen}
		>
			<span className="toggle-button-icon">
				<span className={`hamburger-line ${isOpen ? 'open' : ''}`}></span>
				<span className={`hamburger-line ${isOpen ? 'open' : ''}`}></span>
				<span className={`hamburger-line ${isOpen ? 'open' : ''}`}></span>
			</span>
		</button>
	);
}

export default ToggleButton;
