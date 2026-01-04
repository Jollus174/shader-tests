interface CodeToggleButtonProps {
	isOpen: boolean;
	onClick: () => void;
}

function CodeToggleButton({ isOpen, onClick }: CodeToggleButtonProps) {
	return (
		<button
			className="btn code-toggle-button"
			onClick={onClick}
			aria-label={isOpen ? 'Close code editor' : 'Open code editor'}
			aria-expanded={isOpen}
		>
			<span className="code-toggle-button-text">Code</span>
		</button>
	);
}

export default CodeToggleButton;
