import { useState, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView, keymap } from '@codemirror/view';
import { toggleComment } from '@codemirror/commands';
import { Extension } from '@codemirror/state';
import { cpp } from '@codemirror/lang-cpp';

interface CodeEditorProps {
	value: string;
	onChange: (value: string) => void;
	language?: string;
	onHeightChange?: (height: number) => void;
}

function CodeEditor({ value, onChange, onHeightChange }: CodeEditorProps) {
	const [lineWrapping, setLineWrapping] = useState(true);
	const [editorHeight, setEditorHeight] = useState<number | null>(null);
	const editorViewRef = useRef<EditorView | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const isResizingRef = useRef(false);
	const startYRef = useRef(0);
	const startHeightRef = useRef(0);

	// Use C++ language support (similar syntax to GLSL) for comment support
	// GLSL uses // and /* */ comments, same as C++
	const glslLanguage = cpp();

	// Key binding for comment toggling (Ctrl+/ or Cmd+/)
	const commentKeymap: Extension = keymap.of([
		{
			key: 'Mod-/',
			run: toggleComment
		}
	]);

	// Build extensions array conditionally based on line wrapping
	const extensions = [
		glslLanguage,
		...(lineWrapping ? [EditorView.lineWrapping] : []),
		commentKeymap,
		EditorView.theme({
			'&': {
				fontSize: '14px'
			},
			'.cm-content': {
				padding: '12px',
				minHeight: '100%'
			},
			'.cm-scroller': {
				fontFamily: 'monospace'
			}
		}),
		EditorView.updateListener.of((update) => {
			if (update.view) {
				editorViewRef.current = update.view;
			}
		})
	];

	const handleChange = (val: string) => {
		onChange(val);
	};

	// Unified resize move handler (works for both mouse and touch)
	const handleResizeMove = (clientY: number) => {
		if (!isResizingRef.current || !containerRef.current) return;

		const parentContainer = containerRef.current.closest('.code-editor-container') as HTMLElement;
		if (!parentContainer) return;

		const deltaY = startYRef.current - clientY; // Inverted: dragging up increases height
		const newHeight = Math.max(150, Math.min(window.innerHeight * 0.8, startHeightRef.current + deltaY));
		setEditorHeight(newHeight);
		parentContainer.style.height = `${newHeight}px`;
		onHeightChange?.(newHeight);
	};

	// Mouse event handlers
	const handleResizeStartMouse = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		isResizingRef.current = true;
		startYRef.current = e.clientY;
		if (containerRef.current) {
			const parentContainer = containerRef.current.closest('.code-editor-container') as HTMLElement;
			if (parentContainer) {
				startHeightRef.current = parentContainer.offsetHeight;
			}
		}
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseEnd);
		document.body.style.cursor = 'ns-resize';
		document.body.style.userSelect = 'none';
	};

	const handleMouseMove = (e: MouseEvent) => {
		e.preventDefault();
		handleResizeMove(e.clientY);
	};

	const handleMouseEnd = () => {
		isResizingRef.current = false;
		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseEnd);
		document.body.style.cursor = '';
		document.body.style.userSelect = '';
	};

	// Touch event handlers
	const handleResizeStartTouch = (e: React.TouchEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.touches.length !== 1) return;
		isResizingRef.current = true;
		startYRef.current = e.touches[0].clientY;
		if (containerRef.current) {
			const parentContainer = containerRef.current.closest('.code-editor-container') as HTMLElement;
			if (parentContainer) {
				startHeightRef.current = parentContainer.offsetHeight;
			}
		}
		document.addEventListener('touchmove', handleTouchMove, { passive: false });
		document.addEventListener('touchend', handleTouchEnd);
		document.body.style.userSelect = 'none';
	};

	const handleTouchMove = (e: TouchEvent) => {
		if (!isResizingRef.current || e.touches.length !== 1) return;
		e.preventDefault();
		handleResizeMove(e.touches[0].clientY);
	};

	const handleTouchEnd = () => {
		isResizingRef.current = false;
		document.removeEventListener('touchmove', handleTouchMove);
		document.removeEventListener('touchend', handleTouchEnd);
		document.body.style.userSelect = '';
	};
	
		// Scroll to top when value changes (shader switch)
	useEffect(() => {
		if (editorViewRef.current) {
			// Use requestAnimationFrame to ensure the view is ready
			requestAnimationFrame(() => {
				if (editorViewRef.current) {
					const scrollDOM = editorViewRef.current.scrollDOM;
					if (scrollDOM) {
						scrollDOM.scrollTop = 0;
					}
				}
			});
		}
	}, [value]);

	// Initialize height from CSS variable on mount
	useEffect(() => {
		if (containerRef.current) {
			const parentContainer = containerRef.current.closest('.code-editor-container') as HTMLElement;
			if (parentContainer) {
				const computedHeight = getComputedStyle(parentContainer).height;
				const heightValue = parseFloat(computedHeight);
				if (!isNaN(heightValue)) {
					setEditorHeight(heightValue);
					onHeightChange?.(heightValue);
				}
			}
		}
	}, [onHeightChange]);

	// Cleanup event listeners on unmount
	useEffect(() => {
		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseEnd);
			document.removeEventListener('touchmove', handleTouchMove);
			document.removeEventListener('touchend', handleTouchEnd);
		};
	}, []);

	return (
		<div className="code-editor-wrapper" ref={containerRef} style={editorHeight !== null ? { height: `${editorHeight}px` } : undefined}>
			<div 
				className="code-editor-resize-handle"
				onMouseDown={handleResizeStartMouse}
				onTouchStart={handleResizeStartTouch}
				title="Drag to resize"
			/>
			<div className="code-editor-controls">
				<label className="line-wrap-toggle">
					<input
						type="checkbox"
						checked={lineWrapping}
						onChange={(e) => setLineWrapping(e.target.checked)}
						aria-label="Toggle line wrapping"
					/>
					<span>Wrap lines</span>
				</label>
			</div>

			<CodeMirror
				value={value}
				height="100%"
				theme={oneDark}
				onChange={handleChange}
				extensions={extensions}
				basicSetup={{
					lineNumbers: true,
					highlightSelectionMatches: false,
					indentOnInput: true,
					bracketMatching: true,
					closeBrackets: true,
					autocompletion: false,
					crosshairCursor: false,
					highlightActiveLine: true,
					tabSize: 2
				}}
			/>
		</div>
	);
}

export default CodeEditor;
